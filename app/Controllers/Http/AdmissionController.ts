import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import AdmissionFormResponse from 'App/Models/AdmissionFormResponse'
import AdmissionService from 'App/Services/AdmissionService'
import UserService from 'App/Services/UserService'
import Http from 'App/Utils/Http'
import { Mail } from 'App/Utils/Mail'
import AdmissionResponsesAction from 'App/Validators/Admission/AdmissionResponsesAction'
import _ from 'lodash'
import { stringifyEmail } from 'email-stringify'
import Env from '@ioc:Adonis/Core/Env'
import EnrollClassroom from 'App/Models/EnrollClassroom'

export default class AdmissionController {
  public async responses({ request, response, params }: HttpContextContract) {
    if (!params.classroom_id) throw new ResourceNotFoundException('classroom id is required')
    const form = await AdmissionService.getAdmissionForm(params.classroom_id)
    if (!form) {
      throw new ResourceNotFoundException('inactive admission form')
    }
    const responses = await AdmissionFormResponse.query()
      .preload('user', (userQuery) => userQuery.preload('student'))
      .preload('responses', (responseQuery) => responseQuery.preload('question'))
      .where('status', request.qs().status || 'pending')
      .where('admission_form_id', form?.$attributes.id)
      .exec()

    return Http.respond(response, 'Responses', responses)
  }

  async responsesAction({ request, response }: HttpContextContract) {
    const { actions } = await request.validate(AdmissionResponsesAction)
    const actionsIds = _.map(actions, 'id')
    const admissions = await AdmissionFormResponse.query().whereIn('id', actionsIds).exec()
    if (admissions.length !== actionsIds.length) throw new ResourceNotFoundException('Response not found')

    for (const action of actions) {
      const response = await AdmissionFormResponse.findOrFail(action.id)
      const user = await UserService.findByOrFail('id', response.student_id)
      const form = await AdmissionService.findByOrFail('id', response.admission_form_id)
      const classroom = form.classroom
      const instructor = await UserService.findByOrFail('id', classroom.instructor_id)
      if (!action.admit) {
        response.status = 'rejected'
        await response.save()
        try {
          await Mail.sendEmail(
            user.email,
            'الرد علي طلب تسجيل الفصل',
            await stringifyEmail({
              filename: 'denied-ar',
              args: {
                name: user.first_name,
                classroom_name: classroom.title,
                instructor_name: instructor.first_name + instructor.last_name,
                classroom_url: Env.get('FRONTEND_URL') + '/classroom/' + classroom.label,
              },
            })
          )
        } catch (error) {
          console.log('email failed to be sent', error)
        }
        continue
      }
      const enrolled = await EnrollClassroom.query().where('classroom_id', classroom.id).andWhere('user_id', user.id).first()
      if (!enrolled) {
        await classroom.related('students').attach({
          [user.id]: {
            active: true,
          },
        })
      }
      if (enrolled) {
        enrolled.$attributes.active = true
        await enrolled.save()
      }

      response.status = 'accepted'
      await response.save()

      classroom.enrolled_count += 1
      await classroom.save()

      try {
        await Mail.sendEmail(
          user.email,
          'الرد علي طلب تسجيل الفصل',
          await stringifyEmail({
            filename: 'approved-ar',
            args: {
              name: user.first_name,
              classroom_name: classroom.title,
              classroom_url: Env.get('FRONTEND_URL') + '/classroom/' + classroom.label,
            },
          })
        )
      } catch (error) {
        console.log('email failed to be sent', error)
      }
    }

    return Http.respond(response, 'Done')
  }
}
