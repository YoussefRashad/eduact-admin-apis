import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CourseGetAllValidator from 'App/Validators/CourseValidators/CourseGetAllValidator'
import Course from 'App/Models/Course'
import Classroom from 'App/Models/Classroom'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import CourseGetValidator from 'App/Validators/CourseValidators/CourseGetValidator'
import CoursesUpdateValidator from 'App/Validators/CourseValidators/CoursesUpdateValidator'
import Admin from 'App/Models/Admin'
import CourseDeleteValidator from 'App/Validators/CourseValidators/CourseDeleteValidator'
import CoursesUnenrolledStudentsValidator from 'App/Validators/CourseValidators/CoursesUnenrolledStudentsValidator'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import CourseEnrolledValidation from 'App/Validators/CourseValidators/CourseEnrolled'
import EnrollCourse from '../../Models/EnrollCourse'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import AddCoursePrerequisite from 'App/Validators/CourseValidators/AddCoursePrerequisite'
import CustomException from 'App/Exceptions/CustomException'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import CreateCourseValidator from 'App/Validators/CourseValidators/CreateCourseValidator'
import UpdateUnitsValidator from 'App/Validators/UnitsValidator/UpdateUnitsValidator'
import Unit from 'App/Models/Unit'

export default class CoursesController {
  public async courses({ request, response }: HttpContextContract) {
    const { classroom, page, perPage, from, to, query, filters, sortBy } = await request.validate(CourseGetAllValidator)
    const classroomInstance = await Classroom.query().where('label', classroom).firstOrFail()
    const coursesQuery = Course.query()
      .select('*', 'courses.id', 'courses.name', 'courses.created_at', 'courses.order')
      .leftJoin('sections', 'sections.id', 'courses.section_id')
      .where('courses.classroom_id', classroomInstance.id)
      .preload('section')
    const searchColumns = ['courses.name', 'code', 'description']
    if (sortBy) {
      sortBy.field = sortBy.field === 'name' ? 'courses.' + 'name' : sortBy.field
      sortBy.field = sortBy.field === 'order' ? 'courses.' + 'order' : sortBy.field
      sortBy.field = sortBy.field === 'section_name' ? 'sections.' + 'name' : sortBy.field
      sortBy.field = sortBy.field === 'created_at' ? 'courses.' + sortBy.field : sortBy.field
    }
    ControllersUtils.applyAllQueryUtils(
      coursesQuery,
      from,
      to,
      filters,
      sortBy ? sortBy : { field: 'courses.order', direction: 'asc' },
      searchColumns,
      query,
      'courses'
    )

    // get courses and path from the pivot model relationship
    const courses = await coursesQuery
      .preload('course_prerequisites', (pivotPreloader) => {
        pivotPreloader.preload('prerequisite_course')
      })
      .paginate(page, perPage)
    // return prerequisite paths array
    const coursesAdjustedFormat: any = courses.all().map((course) => {
      let adjustedPaths: any = {}
      course.course_prerequisites.forEach((prerequisite) => {
        if (!adjustedPaths[prerequisite.path]) adjustedPaths[prerequisite.path] = []
        adjustedPaths[prerequisite.path].push(prerequisite.prerequisite_course.toJSON())
      })
      const { course_prerequisites, ...rest } = course.toJSON()
      return { ...rest, prerequisites_paths: Object.values(adjustedPaths) }
    })

    const filterData = await this.fetchCourseFilters()

    return Http.respond(response, 'courses', coursesAdjustedFormat, courses.toJSON().meta, filterData)
  }

  public async fetchCourseFilters() {
    return new DataFilter({
      model: Course,
      filterObjects: [
        {
          name: 'Active',
          value: 'active',
          optionNameColumn: 'active',
          optionValueColumn: 'active',
        },
        {
          name: 'Scores View',
          value: 'scores_view',
          optionNameColumn: 'scores_view',
          optionValueColumn: 'scores_view',
        },
        {
          name: 'Buyable',
          value: 'buyable',
          optionNameColumn: 'buyable',
          optionValueColumn: 'buyable',
        },
      ],
    }).process()
  }

  public async course({ request, response }: HttpContextContract) {
    const { id } = await request.validate(CourseGetValidator)
    const course = await Course.query()
      .where('id', id)
      .preload('units', (query) => {
        query.preload('unitType')
      })
      .preload('course_prerequisites', (pivotPreloader) => {
        pivotPreloader.preload('prerequisite_course')
      })
      .firstOrFail()

    const prerequisites_paths = this.groupPrerequisites(course)
    const { course_prerequisites, ...rest } = course.toJSON()
    const result = { ...rest, prerequisites_paths }

    return Http.respond(response, 'courses', result, course.toJSON().meta)
  }

  public async enrolled({ request, response }: HttpContextContract) {
    const { courseId, page, perPage, query, sortBy, from, to, filters } = await request.validate(CourseEnrolledValidation)
    const course = await Course.find(courseId)
    if (!course) {
      throw new ResourceNotFoundException('course does not exist')
    }
    const searchColumns = ['first_name', 'last_name', 'username', 'email']
    const enrolledQuery = EnrollCourse.query().join('users', 'users.id', 'user_id')
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'enroll_courses.' + sortBy.field : sortBy.field
    }
    ControllersUtils.applyAllQueryUtils(enrolledQuery, from, to, filters, sortBy, searchColumns, query, 'enroll_courses')
    enrolledQuery.where('course_id', courseId).preload('user')
    const enrolledCourse = await enrolledQuery.paginate(page, perPage)
    const enrolledFilters = await this.enrolledFilters()
    return Http.respond(response, 'enrolled course', enrolledCourse.toJSON().data || [], enrolledCourse.toJSON().meta, enrolledFilters)
  }

  public async createCourse({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(CreateCourseValidator)
    const course = await Course.create(reqObj)
    await Admin.logAction(auth.id, 'create course', 'create_course', `Create course ${course.name}`)
    return Http.respond(response, 'created', course)
  }

  public async updateCourse({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(CoursesUpdateValidator)
    const course = await Course.query().where('id', reqObj.id).firstOrFail()
    await course
      .merge({
        ...reqObj,
        old_price: !reqObj.old_price ? null : reqObj.old_price,
      })
      .save()
    await Admin.logAction(auth.id, 'update course', 'update_course', `Update course ${course.name}`)
    return Http.respond(response, 'updated', course)
  }

  public async deleteCourse({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(CourseDeleteValidator)
    const course = await Course.query().where('id', id).firstOrFail()
    await course.delete()
    await Admin.logAction(auth.id, 'delete course', 'delete_course', `Deleted course ${course.name}`)
    return Http.respond(response, 'deleted', course)
  }

  public async getUnEnrolledUsers({ request, response, auth }: HttpContextContract) {
    const { id, page, perPage, query, sortBy, from, to, filters } = await request.validate(CoursesUnenrolledStudentsValidator)
    const studentsQuery = User.query()
    const searchColumns = ['email', 'uuid', 'username', 'phone_number', 'first_name', 'last_name']
    ControllersUtils.applyAllQueryUtils(studentsQuery, from, to, filters, sortBy, searchColumns, query)
    studentsQuery.whereDoesntHave('courses', (coursesQuery) => coursesQuery.where('id', id)).has('student')
    const students = await studentsQuery.paginate(page || 1, perPage || 10)
    return Http.respond(response, 'stdents', students.toJSON().data, students.toJSON().meta)
  }

  public async updatePrerequisiteCourses({ request, response }: HttpContextContract) {
    let { course_id, prerequisites } = await request.validate(AddCoursePrerequisite)
    prerequisites = [...new Set(prerequisites)] // to prevent the duplicates

    const course = await Course.find(course_id)
    if (!course) {
      throw new ResourceNotFoundException('course does not exist')
    }
    const course_prerequisites = await Course.query().whereIn(
      'id',
      prerequisites.map((pre) => pre.prerequisite)
    )
    course_prerequisites.map((course_pre) => {
      if (course_pre.classroom_id !== course.classroom_id) {
        throw new CustomException('Some courses does not exist in the same classroom', 400)
      }
    })

    await course.related('course_prerequisites').query().delete()
    const result = await course.related('course_prerequisites').createMany(prerequisites)

    return Http.respond(response, 'add prerequiste courses', result)
  }

  groupPrerequisites(course: Course) {
    // returns 2d array, paths => each path is an array of prerequisites id's
    let adjustedPaths: any = {}
    course.course_prerequisites.forEach((prerequisite) => {
      if (!adjustedPaths[prerequisite.path]) adjustedPaths[prerequisite.path] = []
      adjustedPaths[prerequisite.path].push(
        prerequisite.prerequisite_course.serialize({
          fields: ['id'],
        }).id
      )
    })
    return Object.values(adjustedPaths)
  }

  public async getAllStudentsInACourse({ request, response }: HttpContextContract) {
    const { courseId, page, perPage, query, sortBy, from, to, filters } = await request.validate(CourseEnrolledValidation)
    const course = await Course.find(courseId)
    if (!course) {
      throw new ResourceNotFoundException('course does not found')
    }
    const searchColumns = ['first_name', 'last_name', 'username', 'email', 'phone_number']
    const enrolledQuery = EnrollCourse.query().join('users', 'users.id', 'user_id').select('*', 'enroll_courses.created_at')
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'enroll_courses.' + sortBy.field : sortBy.field
    }
    ControllersUtils.applyAllQueryUtils(enrolledQuery, from, to, filters, sortBy, searchColumns, query, 'enroll_courses')
    enrolledQuery.where('course_id', courseId).preload('user')

    let unEnrolledQuery: ModelQueryBuilderContract<typeof User> | [] = []
    /**
     * (filters, from, to) used only in enrolled users
     */
    if (!filters?.length && !from && !to) {
      unEnrolledQuery = User.query()
      ControllersUtils.applyAllQueryUtils(
        unEnrolledQuery,
        null,
        null,
        null,
        sortBy?.field === 'enroll_courses.created_at' ? null : sortBy, //Changed above when sorting by created_at
        searchColumns,
        query,
        'users'
      )
      // Get unenrolled users who do not have this course id
      unEnrolledQuery.whereDoesntHave('courses', (coursesQuery) => coursesQuery.where('id', courseId)).has('student')
    }

    // handling the format of unenrolled users
    let unEnrolledResults: any = []
    if ((await unEnrolledQuery).length) {
      unEnrolledResults = (await unEnrolledQuery).map((unEnrolled) => {
        return {
          user_id: unEnrolled.id,
          course_id: null,
          created_at: null,
          updated_at: null,
          purchase_method: null,
          user: unEnrolled,
        }
      })
    }
    const result = [...(await enrolledQuery), ...unEnrolledResults]

    // pagination
    const offset = (page - 1) * perPage
    const paginatedItems = result.slice(offset).slice(0, perPage)
    const total_pages = Math.ceil(result.length / perPage)

    const enrolledFilters = await this.enrolledFilters()
    const meta = {
      total: result.length,
      per_page: perPage,
      current_page: page,
      first_page: 1,
      last_page: total_pages,
    }

    return Http.respond(response, 'enrolled course', paginatedItems || [], meta, enrolledFilters)
  }

  public async enrolledFilters() {
    return new DataFilter({
      model: EnrollCourse,
      filterObjects: [
        {
          name: 'purchase method',
          value: 'purchase_method',
          optionNameColumn: 'purchase_method',
          optionValueColumn: 'purchase_method',
        },
      ],
    }).process()
  }
}
