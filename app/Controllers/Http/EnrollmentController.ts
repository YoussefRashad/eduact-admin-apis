import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import Course from 'App/Models/Course'
import Http from 'App/Utils/Http'
import EnrollmentCountValidator from 'App/Validators/EnrollmentValidator/EnrollmentCountValidator'
import Classroom from 'App/Models/Classroom'
import EnrollmentClassroomCountValidator from 'App/Validators/EnrollmentValidator/EnrollmentClassroomCountValidator'
import Utils from 'App/Utils/Utils'
import ControllersUtils from './ControllersUtils'
import Database from '@ioc:Adonis/Lucid/Database'
import EnrollmentsGetAllValidator from 'App/Validators/EnrollmentValidator/EnrollmentsGetAllValidator'
import EnrollClassroom from 'App/Models/EnrollClassroom'
import DataFilter from 'App/Utils/Filters'
import BanStudentValidator from 'App/Validators/EnrollmentValidator/BanStudentValidator'
import ExportAllClassroomsAnalyticsValidator from 'App/Validators/EnrollmentValidator/ExportAllClassroomsAnalyticsValidator'
import { DateTime } from 'luxon'
import CourseEnrollmentCountValidator from 'App/Validators/EnrollmentValidator/CourseEnrollmentCountValidator'
import ClassroomsEnrollmentGraph from 'App/Validators/EnrollmentValidator/ClassroomsEnrollmentGraph'
import ClassroomEnrollmentGraph from 'App/Validators/EnrollmentValidator/ClassroomEnrollmentGraph'
import CourseEnrollmentGraph from 'App/Validators/EnrollmentValidator/CourseEnrollmentGraph'
import EnrollCourse from '../../Models/EnrollCourse'
export default class EnrollmentController {
  public async classroomEnrollmentCount({ request, response }: HttpContextContract) {
    const { classroom_id, course_id, export: export_, from, to } = await request.validate(EnrollmentCountValidator)
    const classroom = await Classroom.find(classroom_id)
    if (!classroom) throw new ResourceNotFoundException('classroom is not exist')
    let enrolled = await this.enrollmentTotalCalcInsideClassroom(classroom_id, course_id, from, to)
    if (!enrolled) {
      enrolled = {
        purchase_methods: [
          {
            purchase_method: 'wallet',
            purchase_method_count: 0,
          },
          {
            purchase_method: 'scratchcard',
            purchase_method_count: 0,
          },
          {
            purchase_method: 'free',
            purchase_method_count: 0,
          },
          {
            purchase_method: 'admin',
            purchase_method_count: 0,
          },
        ],
        purchase_methods_total: 0,
      }
    }
    if (export_) {
      return Utils.exportCsv(
        response,
        [],
        [
          ...enrolled.purchase_methods,
          {
            purchase_method: 'total',
            purchase_method_count: enrolled.purchase_methods_total,
          },
        ],
        `classroom_total_enrollment ${new Date().toString()}`
      )
    }
    return Http.respond(response, 'classroom enrollment count', enrolled)
  }

  public async enrollmentTotalCalcInsideClassroom(classroom_id, course_id, from, to) {
    const courses = await Course.query()
      .where('classroom_id', classroom_id)
      .if(course_id, (course) => {
        if (course_id) {
          course.where('id', course_id)
        }
      })
      .orderBy('order')

    if (!courses.length) {
      return null
    }

    const enrolledCourses = Database.from('enroll_courses')
      .whereIn(
        'course_id',
        courses.map((course) => course.id)
      )
      .select('enroll_courses.purchase_method')
      .groupBy('enroll_courses.purchase_method')
      .count('enroll_courses.purchase_method')
      .as('purchase_method_count')

    ControllersUtils.applyFromOnQuery(enrolledCourses, from)
    ControllersUtils.applyToOnQuery(enrolledCourses, to)

    const enrolledCoursesResult = await enrolledCourses.exec()
    if (!enrolledCoursesResult.length) {
      return null
    }

    let enrolled: any = []
    let total = 0
    enrolledCoursesResult.forEach((ec) => {
      total += +ec.count
      enrolled.push({
        purchase_method: ec.purchase_method,
        purchase_method_count: ec.count,
      })
    })

    return {
      purchase_methods: [
        {
          purchase_method: 'wallet',
          purchase_method_count: enrolled.find((enr) => enr.purchase_method === 'wallet')?.purchase_method_count ?? 0,
        },
        {
          purchase_method: 'scratchcard',
          purchase_method_count: enrolled.find((enr) => enr.purchase_method === 'scratchcard')?.purchase_method_count ?? 0,
        },
        {
          purchase_method: 'free',
          purchase_method_count: enrolled.find((enr) => enr.purchase_method === 'free')?.purchase_method_count ?? 0,
        },
        {
          purchase_method: 'admin',
          purchase_method_count: enrolled.find((enr) => enr.purchase_method === 'admin')?.purchase_method_count ?? 0,
        },
      ],
      purchase_methods_total: total,
    }
  }

  public async classroomEnrollmentAnalytic({ request, response }: HttpContextContract) {
    const { classroom_id, export: export_, from, to, page, perPage, query } = await request.validate(EnrollmentClassroomCountValidator)

    const classroom = await Classroom.find(classroom_id)
    if (!classroom) {
      throw new ResourceNotFoundException('classroom does not exist')
    }

    const searchColumns = ['courses.name']
    const coursesQuery = Course.query()
      .where('classroom_id', classroom_id)
      .orderBy('order')
      .if(query, (subQuery) => {
        ControllersUtils.applySearchOnQuery(subQuery, searchColumns, query)
      })

    if (!(await coursesQuery.exec()).length) {
      return Http.respond(response, 'there are no available courses', [])
    }

    const enrolled = await this.enrollmentCountCalculation(await coursesQuery.exec(), { from, to })
    if (export_) {
      const result = enrolled.map((enr) => {
        return {
          course_id: enr.course_id,
          course_name: enr.course_name,
          wallet: enr.purchase_methods.find((pur) => pur.purchase_method === 'wallet')?.purchase_method_count ?? 0,
          scratchcard: enr.purchase_methods.find((pur) => pur.purchase_method === 'scratchcard')?.purchase_method_count ?? 0,
          free: enr.purchase_methods.find((pur) => pur.purchase_method === 'free')?.purchase_method_count ?? 0,
          admin: enr.purchase_methods.find((pur) => pur.purchase_method === 'admin')?.purchase_method_count ?? 0,
          total: enr.purchase_methods_total ?? 0,
        }
      })
      return Utils.exportCsv(response, [], result, `classroom_count_enrollment ${new Date().toString()}`)
    }

    const offset = (page - 1) * perPage
    const paginatedItems = enrolled.slice(offset).slice(0, perPage)
    const total_pages = Math.ceil(enrolled.length / perPage)
    const meta = {
      total: enrolled.length,
      per_page: perPage,
      current_page: page,
      first_page: 1,
      last_page: total_pages,
    }
    return Http.respond(response, 'enrollment classroom analytics', paginatedItems, meta)
  }

  public async enrollmentCountCalculation(courses: any, dateRange: { from: DateTime | undefined; to: DateTime | undefined }) {
    const enrolledCourses = Database.from('enroll_courses')
      .whereIn(
        'course_id',
        courses.map((course) => course.id)
      )
      .select('course_id', 'purchase_method')
      .groupBy('course_id', 'purchase_method')
      .count('enroll_courses.purchase_method')
      .as('purchase_method_count')

    ControllersUtils.applyFromOnQuery(enrolledCourses, dateRange.from)
    ControllersUtils.applyToOnQuery(enrolledCourses, dateRange.to)

    const enrolledCoursesResult = await enrolledCourses.exec()

    if (!enrolledCoursesResult.length) {
      return [
        ...courses.map((course) => {
          return {
            course_id: course.id,
            course_name: course.name,
            purchase_methods: [
              {
                purchase_method: 'wallet',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'scratchcard',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'free',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'admin',
                purchase_method_count: 0,
              },
            ],
            purchase_methods_total: 0,
          }
        }),
      ]
    }

    let enrolled: any = []
    courses.forEach((course) => {
      let enrollment = enrolledCoursesResult
        .map((res) => {
          if (res.course_id === course.id) {
            return { name: res.purchase_method, count: +res.count }
          }
        })
        .filter((enr) => enr)
      enrolled.push({
        course_id: course.id,
        course_name: course.name,
        purchase_methods: [
          {
            purchase_method: 'wallet',
            purchase_method_count: enrollment.find((enr) => enr?.name === 'wallet')?.count ?? 0,
          },
          {
            purchase_method: 'scratchcard',
            purchase_method_count: enrollment.find((enr) => enr?.name === 'scratchcard')?.count ?? 0,
          },
          {
            purchase_method: 'free',
            purchase_method_count: enrollment.find((enr) => enr?.name === 'free')?.count ?? 0,
          },
          {
            purchase_method: 'admin',
            purchase_method_count: enrollment.find((enr) => enr?.name === 'admin')?.count ?? 0,
          },
        ],
        purchase_methods_total: enrollment
          .map((enr) => enr?.count)
          .reduce((prev, next) => {
            if (!prev) prev = 0
            return (prev += next ?? 0)
          }, 0),
      })
    })
    return enrolled
  }

  public async getAllUserEnrollments({ request, response }: HttpContextContract) {
    const { classroom_id, page, perPage, from, to, query, filters, sortBy } = await request.validate(EnrollmentsGetAllValidator)
    const enrollClassroom = EnrollClassroom.query()
      .select('*', 'enroll_classrooms.active', 'enroll_classrooms.updated_at')
      .where('classroom_id', classroom_id)
      .innerJoin('users', 'users.id', 'enroll_classrooms.user_id')

    const searchColumns = ['users.first_name', 'users.last_name', 'users.email', 'users.username', 'users.phone_number']

    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'enroll_classrooms.' + sortBy.field : sortBy.field
      sortBy.field = sortBy.field === 'updated_at' ? 'enroll_classrooms.' + sortBy.field : sortBy.field
    }

    ControllersUtils.applyAllQueryUtils(enrollClassroom, from, to, filters, sortBy, searchColumns, query, 'enroll_classrooms')

    const enrollments = await enrollClassroom.preload('user').paginate(page, perPage)
    const filterData = await this.fetchEnrollClassroomFilters()
    return Http.respond(response, 'users enrollments', enrollments.toJSON().data, enrollments.toJSON().meta, filterData)
  }

  public async fetchEnrollClassroomFilters() {
    return await new DataFilter({
      model: EnrollClassroom,
      filterObjects: [
        {
          name: 'Active',
          value: 'enroll_classrooms.active',
          optionNameColumn: 'active',
          optionValueColumn: 'active',
        },
      ],
    }).process()
  }

  public async toggleBanStudent({ request, response }: HttpContextContract) {
    const { classroom_id, user_id, active } = await request.validate(BanStudentValidator)
    await EnrollClassroom.query()
      .where('classroom_id', classroom_id)
      .where('user_id', user_id)
      .update({ active, updated_at: new Date().toISOString() })
    return Http.respond(response, 'Toggle Ban Student')
  }

  public async classroomsEnrollmentAnalytic({ request, response }: HttpContextContract) {
    const { export: export_, from, to, page, perPage, query } = await request.validate(ExportAllClassroomsAnalyticsValidator)
    const searchColumns = ['classrooms.title']
    const classrooms = await Classroom.query()
      .select(['id', 'title'])
      .if(query, (classroomQuery) => {
        ControllersUtils.applySearchOnQuery(classroomQuery, searchColumns, query)
      })

    let enrolledClassrooms = await Promise.all(
      classrooms.map(async (classroom) => {
        let enrolled = await this.enrollmentTotalCalcInsideClassroom(classroom.id, null, from, to)
        if (!enrolled) {
          enrolled = {
            purchase_methods: [
              {
                purchase_method: 'wallet',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'scratchcard',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'free',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'admin',
                purchase_method_count: 0,
              },
            ],
            purchase_methods_total: 0,
          }
        }
        return {
          classroom_name: classroom.title,
          ...enrolled,
        }
      })
    )
    enrolledClassrooms = enrolledClassrooms.filter((val) => val !== null)

    if (export_) {
      const result = enrolledClassrooms.map((enrClassroom) => {
        return {
          classroom_name: enrClassroom?.classroom_name,
          wallet: enrClassroom.purchase_methods.find((pur) => pur.purchase_method === 'wallet')?.purchase_method_count ?? 0,
          admin: enrClassroom.purchase_methods.find((pur) => pur.purchase_method === 'admin')?.purchase_method_count ?? 0,
          scratchcard: enrClassroom.purchase_methods.find((pur) => pur.purchase_method === 'scratchcard')?.purchase_method_count ?? 0,
          free: enrClassroom.purchase_methods.find((pur) => pur.purchase_method === 'free')?.purchase_method_count ?? 0,
          total: enrClassroom.purchase_methods_total ?? 0,
        }
      })
      const exported: any = []
      result.map((res) => {
        exported.push(res)
      })
      return Utils.exportCsv(response, [], exported, `classrooms_analytics ${new Date().toString()}`)
    }

    // pagination
    const offset = (page - 1) * perPage
    const paginatedItems = enrolledClassrooms.slice(offset).slice(0, perPage)
    const total_pages = Math.ceil(enrolledClassrooms.length / perPage)

    const meta = {
      total: enrolledClassrooms.length,
      per_page: perPage,
      current_page: page,
      first_page: 1,
      last_page: total_pages,
    }
    return Http.respond(response, 'enrollment classrooms analytics', paginatedItems || [], meta)
  }

  public async classroomsEnrollmentCount({ response }: HttpContextContract) {
    const classrooms = await Classroom.query().select(['id', 'title'])

    let enrolledClassrooms = await Promise.all(
      classrooms.map(async (classroom) => {
        let enrolled = await this.enrollmentTotalCalcInsideClassroom(classroom.id, null, null, null)
        if (!enrolled) {
          enrolled = {
            purchase_methods: [
              {
                purchase_method: 'wallet',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'scratchcard',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'free',
                purchase_method_count: 0,
              },
              {
                purchase_method: 'admin',
                purchase_method_count: 0,
              },
            ],
            purchase_methods_total: 0,
          }
        }
        return {
          classroom_id: classroom.id,
          classroom_name: classroom.title,
          ...enrolled,
        }
      })
    )
    const counters = {
      wallet_count: 0,
      scratchcard_count: 0,
      free_count: 0,
      admin_count: 0,
      total_count: 0,
    }

    // calculate the enrollments
    enrolledClassrooms.forEach((classroom) => {
      classroom.purchase_methods.map((enrClassroom) => {
        enrClassroom.purchase_method === 'wallet' && (counters.wallet_count += +enrClassroom.purchase_method_count)
        enrClassroom.purchase_method === 'admin' && (counters.admin_count += +enrClassroom.purchase_method_count)
        enrClassroom.purchase_method === 'free' && (counters.free_count += +enrClassroom.purchase_method_count)
        enrClassroom.purchase_method === 'scratchcard' && (counters.scratchcard_count += +enrClassroom.purchase_method_count)
        counters.total_count += +enrClassroom.purchase_method_count
      })
    })
    const countResult = {
      purchase_methods: [
        {
          purchase_method: 'wallet',
          purchase_method_count: counters.wallet_count,
        },
        {
          purchase_method: 'scratchcard',
          purchase_method_count: counters.scratchcard_count,
        },
        {
          purchase_method: 'free',
          purchase_method_count: counters.free_count,
        },
        {
          purchase_method: 'admin',
          purchase_method_count: counters.admin_count,
        },
      ],
      purchase_methods_total: counters.total_count,
    }
    return Http.respond(response, 'classrooms enrollment count', countResult)
  }

  public async courseEnrollmentCount({ request, response }: HttpContextContract) {
    const { course_id } = await request.validate(CourseEnrollmentCountValidator)
    const course = await Course.query().where('id', course_id)
    if (!course.length) {
      throw new ResourceNotFoundException('course does not exist')
    }
    const courseAnalytics = await this.enrollmentCountCalculation(course, { from: undefined, to: undefined })
    return Http.respond(response, 'course enrollment analytics', ...courseAnalytics)
  }

  public async classroomsEnrollmentGraph({ request, response }: HttpContextContract) {
    let { slice, classroom_ids, from, to } = await request.validate(ClassroomsEnrollmentGraph)
    let course_ids
    if (!classroom_ids?.length) {
      course_ids = await EnrollCourse.query().select('course_id').distinct()
      course_ids = course_ids.map((enr) => enr.course_id)
    } else {
      course_ids = await Course.query().whereIn('classroom_id', classroom_ids).select('id as course_id')
      course_ids = course_ids.map((course) => course.$extras.course_id)
    }
    const adminEnrollmentGraph = this.enrollmentGraph(slice, 'admin', course_ids, from, to)
    const freeEnrollmentGraph = this.enrollmentGraph(slice, 'free', course_ids, from, to)
    const scratchCardEnrollmentGraph = this.enrollmentGraph(slice, 'scratchcard', course_ids, from, to)
    const walletEnrollmentGraph = this.enrollmentGraph(slice, 'wallet', course_ids, from, to)
    const enrollmentGraph = await Promise.all([adminEnrollmentGraph, freeEnrollmentGraph, scratchCardEnrollmentGraph, walletEnrollmentGraph])

    return Http.respond(response, 'classrooms enrollment graph', [
      {
        id: 'admin',
        data: enrollmentGraph[0],
      },
      {
        id: 'free',
        data: enrollmentGraph[1],
      },
      {
        id: 'scratchcard',
        data: enrollmentGraph[2],
      },
      {
        id: 'wallet',
        data: enrollmentGraph[3],
      },
    ])
  }

  public async classroomEnrollmentGraph({ request, response }: HttpContextContract) {
    let { slice, classroom_id, course_ids, from, to } = await request.validate(ClassroomEnrollmentGraph)
    let enrollCourseIds: number[] = (
      await EnrollCourse.query()
        .select('course_id')
        .join('courses', 'courses.id', 'enroll_courses.course_id')
        .where('courses.classroom_id', classroom_id)
        .distinct()
    ).map((enr) => enr.course_id)
    course_ids = enrollCourseIds?.filter((enrCourse) => course_ids?.includes(enrCourse))

    const adminEnrollmentGraph = this.enrollmentGraph(slice, 'admin', course_ids?.length ? course_ids : enrollCourseIds, from, to)
    const freeEnrollmentGraph = this.enrollmentGraph(slice, 'free', course_ids?.length ? course_ids : enrollCourseIds, from, to)
    const scratchCardEnrollmentGraph = this.enrollmentGraph(slice, 'scratchcard', course_ids?.length ? course_ids : enrollCourseIds, from, to)
    const walletEnrollmentGraph = this.enrollmentGraph(slice, 'wallet', course_ids?.length ? course_ids : enrollCourseIds, from, to)
    const enrollmentGraph = await Promise.all([adminEnrollmentGraph, freeEnrollmentGraph, scratchCardEnrollmentGraph, walletEnrollmentGraph])

    return Http.respond(response, 'classroom enrollment graph', [
      {
        id: 'admin',
        data: enrollmentGraph[0],
      },
      {
        id: 'free',
        data: enrollmentGraph[1],
      },
      {
        id: 'scratchcard',
        data: enrollmentGraph[2],
      },
      {
        id: 'wallet',
        data: enrollmentGraph[3],
      },
    ])
  }

  public async courseEnrollmentGraph({ request, response }: HttpContextContract) {
    const { slice, course_id, from, to } = await request.validate(CourseEnrollmentGraph)
    const adminEnrollmentGraph = this.enrollmentGraph(slice, 'admin', [course_id], from, to)
    const freeEnrollmentGraph = this.enrollmentGraph(slice, 'free', [course_id], from, to)
    const scratchCardEnrollmentGraph = this.enrollmentGraph(slice, 'scratchcard', [course_id], from, to)
    const walletEnrollmentGraph = this.enrollmentGraph(slice, 'wallet', [course_id], from, to)
    const enrollmentGraph = await Promise.all([adminEnrollmentGraph, freeEnrollmentGraph, scratchCardEnrollmentGraph, walletEnrollmentGraph])

    return Http.respond(response, 'course enrollment graph', [
      {
        id: 'admin',
        data: enrollmentGraph[0],
      },
      {
        id: 'free',
        data: enrollmentGraph[1],
      },
      {
        id: 'scratchcard',
        data: enrollmentGraph[2],
      },
      {
        id: 'wallet',
        data: enrollmentGraph[3],
      },
    ])
  }

  async enrollmentGraph(slice: string, purchase_method: string, course_ids: number[], from: DateTime, to: DateTime) {
    const enrollmentMonthYearSlice = `TO_CHAR(enroll_courses.created_at, 'mon'), '-', TO_CHAR(enroll_courses.created_at, 'YY')`
    const calenderMonthYearSlice = `TO_CHAR(c, 'mon'), '-', TO_CHAR(c, 'YY')`
    const mapperSlice = {
      year: {
        calenderSlice: `TO_CHAR(c, 'YYYY')`,
        enrollmentSlice: `TO_CHAR(enroll_courses.created_at, 'YYYY')`,
      },
      month: {
        calenderSlice: `CONCAT(${calenderMonthYearSlice})`,
        enrollmentSlice: `CONCAT(${enrollmentMonthYearSlice})`,
      },
      week: {
        calenderSlice: `CONCAT(TO_CHAR(c, 'w'), '-', ${calenderMonthYearSlice})`,
        enrollmentSlice: `CONCAT(TO_CHAR(enroll_courses.created_at, 'w'), '-', ${enrollmentMonthYearSlice})`,
      },
      day: {
        calenderSlice: `CONCAT(TO_CHAR(c, 'dd'), '-', ${calenderMonthYearSlice})`,
        enrollmentSlice: `CONCAT(TO_CHAR(enroll_courses.created_at, 'dd'), '-', ${enrollmentMonthYearSlice})`,
      },
    }
    const slicingBy =
      slice === 'year' ? mapperSlice.year : slice === 'month' ? mapperSlice.month : slice === 'week' ? mapperSlice.week : mapperSlice.day

    const enrollmentGraph = await Database.rawQuery(
      `
      SELECT calender.slice as x, ${course_ids.length ? 'coalesce(main.count, 0) ' : '0'} as y
      FROM (
        SELECT
          purchase_method, ${slicingBy.enrollmentSlice} as slice, count(${slicingBy.enrollmentSlice})
        FROM enroll_courses
        WHERE
          ${course_ids.length ? 'course_id IN (' + course_ids.join() + ') AND ' : ''}
          enroll_courses.purchase_method = '${purchase_method}'
          AND enroll_courses.created_at >= '${from}'
          AND enroll_courses.created_at <= '${to}'
        GROUP BY
          ${slicingBy.enrollmentSlice}, purchase_method
      ) as main
      RIGHT JOIN (
        SELECT
          ${slicingBy.calenderSlice} as slice
        FROM generate_series(
          '${from}'::date, '${to}'::date, '1 ${slice}'
        ) s(c)
      ) as calender
      ON main.slice = calender.slice
      `
    ).exec()
    return enrollmentGraph.rows
  }
}
