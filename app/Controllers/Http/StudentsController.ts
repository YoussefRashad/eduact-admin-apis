import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import StudentFindValidator from 'App/Validators/StudentValidators/StudentFindValidator'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import StudentUpdateValidator from 'App/Validators/StudentValidators/StudentUpdateValidator'
import Student from 'App/Models/Student'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import StudentEnrollToCourseValidator from 'App/Validators/StudentValidators/StudentEnrollToCourseValidator'
import Course from 'App/Models/Course'
import CustomException from 'App/Exceptions/CustomException'
import StudentService from 'App/Services/StudentService'
import Admin from 'App/Models/Admin'
import StudentUnenrollFromCourseValidator from 'App/Validators/StudentValidators/StudentUnenrollFromCourseValidator'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import Utils from 'App/Utils/Utils'
import Database from '@ioc:Adonis/Lucid/Database'
import EducationLanguage from '../../Models/EducationLanguage'
import EducationType from 'App/Models/EducationType'
import EducationSection from 'App/Models/EducationSection'
import EducationYear from 'App/Models/EducationYear'
import ForbiddenException from 'App/Exceptions/ForbiddenException'

export default class StudentsController {
  public async getStudent({ request, response }: HttpContextContract) {
    const { uuid } = await request.validate(new StudentFindValidator())
    const user = await User.query()
      .where('uuid', uuid)
      .preload('wallet_logs', (walletLogsQuery) => walletLogsQuery.orderBy('created_at', 'desc'))
      .preload('timeline_logs', (timelineLogsQuery) => timelineLogsQuery.orderBy('created_at', 'desc'))
      .preload('courses', (courseQuery) => courseQuery.preload('classroom'))
      .preload('student', (studentQuery) =>
        studentQuery
          .preload('address', (addressQuery) => {
            addressQuery.preload('governorate_relation').preload('city_relation')
          })
          .preload('wallet')
          .preload('ips')
          .preload('trusted_devices')
          .preload('classrooms', (classroomQuery) => classroomQuery.preload('instructor', (instructorQuery) => instructorQuery.preload('user')))
          .preload('cards')
          .preload('invoices', (invoicesQuery) => invoicesQuery.preload('transaction'))
          .preload('cards', (scratchCardQuery) => scratchCardQuery.preload('classroom').preload('course'))
          .preload('recharge_cards')
      )
      .first()
    if (!user) {
      throw new ResourceNotFoundException('User not found')
    }
    let result = {
      ...user.$attributes,
      ...user.$preloaded,
      courses: [
        ...user.courses.map((course) => {
          return {
            course,
            $extras: course.$extras,
          }
        }),
      ],
    }
    return Http.respond(response, 'students', result)
  }

  public async updateStudent({ request, response }: HttpContextContract) {
    const requestObj = await request.validate(new StudentUpdateValidator())
    const user = await User.query().has('student').where('uuid', requestObj.uuid).firstOrFail()
    await Student.update_(user, requestObj)
    await user.load('student', (studentQuery) => studentQuery.preload('address'))
    return Http.respond(response, 'students', user)
  }

  public async all({ request, response }: HttpContextContract) {
    const { page, perPage, sortBy, filters, from, to, query, export: export_ } = await request.validate(new GeneralAllValidator())
    const filterData = await this.fetchStudentFilters()
    const studentQuery = User.query()
      .select(
        'users.id',
        'uuid',
        'username',
        'email',
        'phone_number',
        'first_name',
        'last_name',
        'email_verified',
        'users.created_at',
        'users.updated_at',
        'students.profile_complete'
      )
      .join('students', 'users.id', 'students.user_id')
      .leftJoin('wallets', 'users.id', 'wallets.user_id')

    const searchColumns = [
      'users.uuid',
      'users.email',
      'users.username',
      'users.phone_number',
      'users.first_name',
      'users.last_name',
      'students.parent1_phone',
      'students.parent2_phone',
      'students.school',
    ]
    const newFilters = filters?.map((filter) => {
      if (filter['education_languages.id']) {
        filter['education_language_id'] = filter['education_languages.id']
        delete filter['education_languages.id']
      } else if (filter['education_types.id']) {
        filter['education_type_id'] = filter['education_types.id']
        delete filter['education_types.id']
      } else if (filter['education_sections.id']) {
        filter['education_section_id'] = filter['education_sections.id']
        delete filter['education_sections.id']
      } else if (filter['education_years.id']) {
        filter['education_year_id'] = filter['education_years.id']
        delete filter['education_years.id']
      }
      return filter
    })
    ControllersUtils.applyAllQueryUtils(studentQuery, from, to, filters, sortBy, searchColumns, query, 'users')
    if (export_) {
      let result = Database.query()
        .from('users')
        .select(
          'users.id',
          'users.lms_id',
          'users.username',
          'users.email',
          'users.phone_number',
          'users.first_name',
          'users.middle_name',
          'users.last_name',
          'users.gender',
          'users.birth_date',
          'users.email_verified',
          'wallets.amount as wallet',
          'students.school',
          'students.parent1_relation',
          'students.parent1_phone',
          'students.parent2_relation',
          'students.parent2_phone',
          'students.profile_complete',
          'education_types.name as edu_types',
          'education_languages.name as edu_language',
          'education_years.name as edu_year',
          'education_sections.name as edu_section',
          'g.name as governorate',
          'c.name as city'
        )
        .select(
          'users.id',
          'users.lms_id',
          'users.username',
          'users.email',
          'users.phone_number',
          'users.first_name',
          'users.middle_name',
          'users.last_name',
          'users.gender',
          'users.birth_date',
          'users.email_verified',
          'wallets.amount as wallet',
          'students.school',
          'students.parent1_relation',
          'students.parent1_phone',
          'students.parent2_relation',
          'students.parent2_phone',
          'students.profile_complete',
          'education_types.name as edu_types',
          'education_languages.name as edu_language',
          'education_years.name as edu_year',
          'education_sections.name as edu_section',
          'g.name as governorate',
          'c.name as city'
        )
        .rightJoin('students', 'users.id', 'students.user_id')
        .leftJoin('wallets', 'users.id', 'wallets.user_id')
        .leftJoin('addresses', 'users.id', 'addresses.user_id')
        .leftJoin('education_types', 'students.education_type_id', 'education_types.id')
        .leftJoin('education_languages', 'students.education_language_id', 'education_languages.id')
        .leftJoin('education_years', 'students.education_year_id', 'education_years.id')
        .leftJoin('education_sections', 'students.education_section_id', 'education_sections.id')
        .joinRaw('left join governorates g on g.id = cast(addresses.governorate as int)')
        .joinRaw('left join cities c on c.id = cast(addresses.city as int)')
      ControllersUtils.applyAllQueryUtils(result, from, to, newFilters, sortBy, searchColumns, query, 'users')
      return Utils.exportCsv(response, [], await result.exec(), `students ${new Date().toString()}`)
    }
    const students = await studentQuery.preload('student', (studentQuery) => studentQuery.preload('wallet')).paginate(page, perPage)
    return Http.respond(response, 'students', students.toJSON().data, students.toJSON().meta, filterData)
  }

  public async fetchStudentFilters() {
    const userFilters = new DataFilter({
      model: User,
      filterObjects: [
        {
          name: 'Email Verified',
          value: 'email_verified',
          optionNameColumn: 'email_verified',
          optionValueColumn: 'email_verified',
        },
        {
          name: 'Gender',
          value: 'gender',
          optionNameColumn: 'gender',
          optionValueColumn: 'gender',
        },
      ],
    }).process()

    const studentFilters = new DataFilter({
      model: Student,
      filterObjects: [
        {
          name: 'Profile Complete',
          value: 'profile_complete',
          optionNameColumn: 'profile_complete',
          optionValueColumn: 'profile_complete',
        },
      ],
    }).process()

    const educationLanguageFilters = new DataFilter({
      model: EducationLanguage,
      filterObjects: [
        {
          name: 'Language',
          value: 'education_languages.id',
          optionNameColumn: 'name',
          optionValueColumn: 'id',
        },
      ],
    }).process()

    const educationTypeFilters = new DataFilter({
      model: EducationType,
      filterObjects: [
        {
          name: 'Type',
          value: 'education_types.id',
          optionNameColumn: 'name',
          optionValueColumn: 'id',
        },
      ],
    }).process()

    const educationSectionFilters = new DataFilter({
      model: EducationSection,
      filterObjects: [
        {
          name: 'Section',
          value: 'education_sections.id',
          optionNameColumn: 'name',
          optionValueColumn: 'id',
        },
      ],
    }).process()

    const educationYearFilters = new DataFilter({
      model: EducationYear,
      filterObjects: [
        {
          name: 'Year',
          value: 'education_years.id',
          optionNameColumn: 'name',
          optionValueColumn: 'id',
        },
      ],
    }).process()

    const filters = await Promise.all([
      studentFilters,
      userFilters,
      educationLanguageFilters,
      educationTypeFilters,
      educationSectionFilters,
      educationYearFilters,
    ])
    return [...filters[0], ...filters[1], ...filters[2], ...filters[3], ...filters[4], ...filters[5]]
  }

  public async enrollInCourse({ request, response, auth }: HttpContextContract) {
    const { id, email, deduct } = await request.validate(StudentEnrollToCourseValidator)
    const course = await Course.query().where('id', id).firstOrFail()
    if (course.expired) throw new ForbiddenException('Course is expired')
    const { user, student, wallet } = await User.getStudentBasicInfo('email', email)
    const enrolledCourse = await student.related('courses').query().where('id', course.id).first()
    if (enrolledCourse) throw new CustomException('User is already enrolled in this course', 409)
    if (deduct && wallet.amount - course.price < 0) {
      throw new CustomException('not enough money', 405)
    }
    const now = new Date()
    await student.related('courses').attach({
      [course.id]: {
        purchase_method: 'admin',
        expired: false,
        expire_at: course.expiry_period ? new Date(now.setDate(now.getDate() + course.expiry_period)) : null,
      },
    })
    if (deduct) {
      await StudentService.deductFromWallet(user, course.price, wallet, 'Wallet Deduct')
    }

    await Admin.logAction(auth.id, 'enroll in course', 'enroll_in_course', `enroll user ${user.username} in course ${course.name}`)
    return Http.respond(response, 'User enrolled in course')
  }

  public async unEnrollFromCourse({ request, response, auth }: HttpContextContract) {
    const { id, email, refund } = await request.validate(StudentUnenrollFromCourseValidator)
    const course = await Course.query().where('id', id).firstOrFail()
    const { user, wallet, student } = await User.getStudentBasicInfo('email', email)
    const enrolledCourse = await student.related('courses').query().where('id', course.id).first()
    if (!enrolledCourse) throw new CustomException('User is not enrolled in this course', 409)
    await student.related('courses').detach([course.id])
    if (refund) await StudentService.addToWallet(user, course.price, wallet, 'Wallet Refund')
    return Http.respond(response, 'User unenrolled from course')
  }
}
