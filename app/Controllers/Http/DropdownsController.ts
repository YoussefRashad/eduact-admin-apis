import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Governorate from 'App/Models/Governorate'
import DropDownService from 'App/Services/DropDownService'
import PrerequisiteValidator from 'App/Validators/DropdownValidator/PrerequisiteValidator'
import Http from 'App/Utils/Http'
import { serialize } from 'v8'

export default class DropdownsController {
  async dropdownInstructors({ response }: HttpContextContract) {
    const instructors = await DropDownService.instructors()
    return Http.respond(response, 'categories', instructors)
  }

  async dropdownCategories({ response }: HttpContextContract) {
    const categories = await DropDownService.categories()
    return Http.respond(response, 'categories', categories)
  }

  async dropdownClassrooms({ response }: HttpContextContract) {
    const classrooms = await DropDownService.classrooms()
    return Http.respond(response, 'classrooms', classrooms)
  }

  async dropdownCourses({ response, params }: HttpContextContract) {
    const { classroom_id } = params
    const courses = await DropDownService.courses(classroom_id)
    return Http.respond(response, 'courses', courses)
  }

  async dropdownUnits({ response, params }: HttpContextContract) {
    const { course_id } = params
    const courses = await DropDownService.units(course_id)
    return Http.respond(response, 'units', courses)
  }

  async dropdownSections({ response, params }: HttpContextContract) {
    const { classroom_id } = params
    const courses = await DropDownService.sections(classroom_id)
    return Http.respond(response, 'sections', courses)
  }

  async dropdownBatches({ response }: HttpContextContract) {
    const batches = await DropDownService.batches()
    return Http.respond(response, 'batches', batches)
  }

  async dropdownRechargeCardsBatches({ response }: HttpContextContract) {
    const batches = await DropDownService.rechargeCardsBatches()
    return Http.respond(response, 'batches', batches)
  }

  public async dropdownAddresses({ response }: HttpContextContract) {
    const addresses = await Governorate.query().preload('cities')
    return Http.respond(response, 'admin', addresses)
  }

  async dropdownPrerequisites({ request, response }: HttpContextContract) {
    const { classroom_id } = await request.validate(PrerequisiteValidator)
    const courses = await DropDownService.prerequisites(classroom_id)

    const serializedCourses = courses.map((course) =>
      course.serialize({
        fields: ['id', 'name'],
        relations: {
          course_prerequisites: {
            fields: ['path', 'course'],
            relations: {
              course: {
                fields: ['id', 'name'],
              },
            },
          },
        },
      })
    )

    const coursesAdjustedFormat: any = serializedCourses.map((course) => {
      let adjustedPaths: any = {}
      course.course_prerequisites.forEach((prerequisite) => {
        if (!adjustedPaths[prerequisite.path]) adjustedPaths[prerequisite.path] = []
        adjustedPaths[prerequisite.path].push(prerequisite.course)
      })
      const { course_prerequisites, ...rest } = course
      return { ...rest, prerequisites_paths: Object.values(adjustedPaths) }
    })

    return Http.respond(response, 'prerequisites', coursesAdjustedFormat)
  }
}
