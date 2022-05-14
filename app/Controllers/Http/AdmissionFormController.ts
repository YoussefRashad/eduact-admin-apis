import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import Http from 'App/Utils/Http'
import AddQuestionValidation from 'App/Validators/AdmissionFormValidator/AddQuestionValidation'
import CreateAdmissionFormValidator from 'App/Validators/AdmissionFormValidator/CreateAdmissionFormValidator'
import GetAdmissionFormByClassroomIdValidator from 'App/Validators/AdmissionFormValidator/GetAdmissionFormByClassroomIdValidator'
import GetAdmissionFormByIdValidator from 'App/Validators/AdmissionFormValidator/GetAdmissionFormByIdValidator'
import RemoveQuestionValidator from 'App/Validators/AdmissionFormValidator/RemoveQuestionValidator'
import UpdateAdmissionFormValidator from 'App/Validators/AdmissionFormValidator/UpdateAdmissionFormValidator'
import UpdateQuestionValidator from 'App/Validators/AdmissionFormValidator/UpdateQuestionValidator'
import AdmissionForm from '../../Models/AdmissionForm'
import Classroom from '../../Models/Classroom'
import Question from '../../Models/Question'

export default class AdmissionFormController {
  public async getByClassroomId({ request, response }: HttpContextContract) {
    const { classroom_id } = await request.validate(GetAdmissionFormByClassroomIdValidator)
    const admissionForm = await AdmissionForm.query()
      .whereHas('classroom', (classroomQuery) => {
        classroomQuery.where('id', classroom_id)
      })
      .preload('questions')
      .first()
    if (!admissionForm) {
      throw new ResourceNotFoundException('classroom does not contain an admission form')
    }
    return Http.respond(response, 'get admission form by classroom id', {
      ...admissionForm.$attributes,
      questions: [
        ...admissionForm.questions.map((question) => {
          return {
            ...question.$attributes,
            options: JSON.parse(question.options),
          }
        }),
      ],
    })
  }

  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetAdmissionFormByIdValidator)

    const admissionForm = await AdmissionForm.query()
      .where('id', id)
      .preload('questions', (questionsPreloader) => {
        questionsPreloader.pivotColumns(['order']).orderBy('order')
      })
      .firstOrFail()

    const withOrder: any = {
      ...admissionForm.toJSON(),
      questions: admissionForm.questions.map((question) => ({ ...question.toJSON(), order: question.$extras.pivot_order })),
    }

    return Http.respond(response, 'get admission form with questions', withOrder)
  }

  public async createAdmissionForm({ request, response }: HttpContextContract) {
    const { classroom_id, admissionForm, questions } = await request.validate(CreateAdmissionFormValidator)
    const admission = await AdmissionForm.create(admissionForm)
    await Promise.all(
      questions.map(async (question) => {
        await admission.related('questions').create(
          {
            question: question.question,
            type: question.type,
            options: JSON.stringify(question.options),
          },
          {
            order: question.order,
          }
        )
      })
    )
    await Classroom.query().where('id', classroom_id).update({
      admission_form_id: admission.id,
      has_admission: true,
    })
    return Http.respond(response, 'create admission form', admission)
  }

  public async updateAdmissionForm({ request, response }: HttpContextContract) {
    const { id, questions, admissionForm } = await request.validate(UpdateAdmissionFormValidator)
    const admissionFormQuery = await AdmissionForm.find(id)
    if (!admissionFormQuery) {
      throw new ResourceNotFoundException('admission form does not exist')
    }
    if (admissionForm) {
      await admissionFormQuery.merge(admissionForm).save()
    }
    await Promise.all(
      questions.map(async (question) => {
        if (!question.id) {
          await admissionFormQuery.related('questions').create(
            {
              question: question.question,
              type: question.type,
              options: JSON.stringify(question.options),
            },
            {
              order: question.order,
            }
          )
        } else {
          const questionQuery = await Question.find(question.id)
          if (questionQuery) {
            await questionQuery
              .merge({
                question: question.question,
                type: question.type,
                options: JSON.stringify(question.options),
              })
              .save()
            if (question.order) {
              await questionQuery
                .related('admissionForms')
                .query()
                .wherePivot('admission_form_id', admissionFormQuery.id)
                .andWherePivot('question_id', question.id)
                .update({ order: question.order })
            }
          }
        }
      })
    )
    return Http.respond(response, 'admission form updated')
  }

  public async updateQuestions({ request, response }: HttpContextContract) {
    const { admission_form_id, questions } = await request.validate(UpdateQuestionValidator)
    const admissionForm = await AdmissionForm.find(admission_form_id)
    if (!admissionForm) {
      throw new ResourceNotFoundException('admission form does not exist')
    }

    await Promise.all(
      questions.map(async (question) => {
        if (!question.id) {
          await admissionForm.related('questions').create(
            {
              question: question.question,
              type: question.type,
              options: JSON.stringify(question.options),
            },
            {
              order: question.order,
            }
          )
        } else {
          const questionQuery = await Question.find(question.id)
          if (questionQuery) {
            await questionQuery
              .merge({
                question: question.question,
                type: question.type,
                options: JSON.stringify(question.options),
              })
              .save()
            await questionQuery
              .related('admissionForms')
              .query()
              .wherePivot('admission_form_id', admission_form_id)
              .andWherePivot('question_id', question.id)
              .update({ order: question.order })
          }
        }
      })
    )

    return Http.respond(response, 'question updated')
  }

  public async removeQuestionFromAdmission({ request, response }: HttpContextContract) {
    const { admission_form_id, question_id } = await request.validate(RemoveQuestionValidator)
    const admissionForm = await AdmissionForm.find(admission_form_id)
    if (!admissionForm) {
      throw new ResourceNotFoundException('Admission form does not exist')
    }
    const question_form = await admissionForm.related('questions').query().where('form_questions.question_id', question_id).delete().first()
    if (!question_form) {
      throw new ResourceNotFoundException('Admission does not contain this question')
    }

    const questions = await Database.from('form_questions').where('admission_form_id', admission_form_id).orderBy('order')

    for (let [index, question] of Object.entries(questions)) {
      await Database.from('form_questions')
        .where('admission_form_id', admission_form_id)
        .andWhere('question_id', question.question_id)
        .update('order', Number(index) + 1)
        .exec()
    }

    return Http.respond(response, `question ${question_id} is deleted successfully`)
  }

  public async addQuestion({ request, response }: HttpContextContract) {
    const { admission_form_id, order, ...rest } = await request.validate(AddQuestionValidation)
    const admissionForm = await AdmissionForm.find(admission_form_id)
    if (!admissionForm) {
      throw new ResourceNotFoundException('admission form does not exist')
    }

    let questionsAfterUpdateOptions = {
      ...rest,
      options: JSON.stringify(rest.options),
    }
    let question = await admissionForm.related('questions').create(questionsAfterUpdateOptions, { order })
    return Http.respond(response, 'Add Question', question)
  }
}
