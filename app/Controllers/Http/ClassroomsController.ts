import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Classroom from 'App/Models/Classroom'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import ClassroomGetValidator from 'App/Validators/ClassroomValidators/ClassroomGetValidator'
import ClassroomCreateValidator from 'App/Validators/ClassroomValidators/ClassroomCreateValidator'
import Admin from 'App/Models/Admin'
import ClassroomUpdateValidator from 'App/Validators/ClassroomValidators/ClassroomUpdateValidator'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import ClassroomEnrolledValidation from 'App/Validators/ClassroomValidators/ClassroomEnrolled'
import EnrollClassroom from '../../Models/EnrollClassroom'
import ResourceNotFoundException from '../../Exceptions/ResourceNotFoundException'
import EducationLanguage from 'App/Models/EducationLanguage'
import EducationType from 'App/Models/EducationType'
import EducationSection from '../../Models/EducationSection'
import EducationYear from '../../Models/EducationYear'
import Category from '../../Models/Category'
import User from '../../Models/User'
import CustomException from '../../Exceptions/CustomException'
import ClassroomService from '../../Services/ClassroomService'
import ClassroomUpdateCurriculum from 'App/Validators/ClassroomValidators/ClassroomUpdateCurriculum'
import ClassroomTab from '../../Models/ClassroomTab';
import Section from '../../Models/Section';
import Course from '../../Models/Course';

export default class ClassroomsController {
  classroomService = new ClassroomService()
  public async classrooms({ request, response }: HttpContextContract) {
    const { filters, from, to, query, sortBy, perPage, page } = await request.validate(GeneralAllValidator)

    const education_language = filters?.find((filter) => filter['education_languages.id'])
    const education_section = filters?.find((filter) => filter['education_sections.id'])
    const education_type = filters?.find((filter) => filter['education_types.id'])
    const education_year = filters?.find((filter) => filter['education_years.id'])
    const instructorFilter = filters?.find((filter) => filter['instructors.id'])
    const active = filters
      ?.map((filter) => {
        return filter.active === true ? filter.active : filter.active === false ? filter.active : null
      })
      .filter((val) => val !== null)[0]

    const newFilters = filters
      ?.map((filter) => {
        if (filter['education_languages.id']) return null
        if (filter['education_sections.id']) return null
        if (filter['education_types.id']) return null
        if (filter['education_years.id']) return null
        if (filter['instructors.id']) return null
        if (filter.active === true || filter.active === false) return null
        return filter
      })
      .filter((val) => val !== null)

    const searchColumns = ['classrooms.title', 'classrooms.description', 'classrooms.label', 'categories.name', 'users.first_name', 'users.last_name']

    const classroomsQuery = Classroom.query()
      .select('*')
      .select('classrooms.id')
      .select('classrooms.weight')
      .select('instructors.label as instructor_label')
      .select('classrooms.label as label')
      .select('users.id as user_id')
      .select('classrooms.created_at')
      .select('classrooms.updated_at')
      .select('instructors.user_id as instructor_id')
      .innerJoin('users', 'classrooms.instructor_id', 'users.id')
      .innerJoin('instructors', 'classrooms.instructor_id', 'instructors.user_id')
      .innerJoin('categories', 'classrooms.category_id', 'categories.id')
      .if(active !== undefined, (query) => query.where('classrooms.active', active))

    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'classrooms.' + sortBy.field : sortBy.field
      sortBy.field = sortBy.field === 'id' ? 'classrooms.' + sortBy.field : sortBy.field
      sortBy.field = sortBy.field === 'category_name' ? 'categories.name' : sortBy.field
      sortBy.field = sortBy.field === 'label' ? 'classrooms.label' : sortBy.field
      sortBy.field = sortBy.field === 'weight' ? 'classrooms.weight' : sortBy.field
    }

    ControllersUtils.applyAllQueryUtils(classroomsQuery, from, to, newFilters, sortBy, searchColumns, query, 'classrooms')

    classroomsQuery.whereHas('instructor', (query) => {
      query.if(instructorFilter, (instructorQuery) => {
        instructorQuery.where('user_id', instructorFilter['instructors.id'])
      })

      if (education_language)
        query.whereHas('educationLanguages', (educationLanguagesQuery) => {
          educationLanguagesQuery.where('id', education_language['education_languages.id'])
        })

      if (education_section)
        query.whereHas('educationSections', (educationSectionsQuery) => {
          educationSectionsQuery.where('id', education_section['education_sections.id'])
        })

      if (education_type)
        query.whereHas('educationTypes', (educationTypesQuery) => {
          educationTypesQuery.where('id', education_type['education_types.id'])
        })

      if (education_year)
        query.whereHas('educationYears', (educationYearsQuery) => {
          educationYearsQuery.where('id', education_year['education_years.id'])
        })
    })

    const classrooms = await classroomsQuery
      .preload('instructor', (instructorQuery) => instructorQuery.preload('user'))
      .preload('category')
      .preload('educationTypes')
      .preload('educationYears')
      .paginate(page, perPage)

    const filterData = await this.fetchClassroomFilters()
    return Http.respond(response, 'classrooms', classrooms.toJSON().data, classrooms.toJSON().meta, filterData)
  }

  public async fetchClassroomFilters() {
    const classroomFilters = new DataFilter({
      model: Classroom,
      filterObjects: [
        {
          name: 'Status',
          value: 'status',
          optionNameColumn: 'status',
          optionValueColumn: 'status',
        },
        {
          name: 'Type',
          value: 'type',
          optionNameColumn: 'type',
          optionValueColumn: 'type',
        },
        {
          name: 'Active',
          value: 'active',
          optionNameColumn: 'active',
          optionValueColumn: 'active',
        },
        {
          name: 'Has Admission',
          value: 'has_admission',
          optionNameColumn: 'has_admission',
          optionValueColumn: 'has_admission',
        },
        {
          name: 'payment_methods',
          value: 'payment_methods_allowed',
          optionNameColumn: 'payment_methods_allowed',
          optionValueColumn: 'payment_methods_allowed',
        },
        {
          name: 'sub_type',
          value: 'sub_type',
          optionNameColumn: 'sub_type',
          optionValueColumn: 'sub_type',
        },
      ],
    }).process()

    const categoryFilters = new DataFilter({
      model: Category,
      filterObjects: [
        {
          name: 'Category',
          value: 'categories.name',
          optionNameColumn: 'name',
          optionValueColumn: 'name',
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
    const instructorsUsernames = User.query().join('instructors', 'users.id', 'instructors.user_id').select(['id', 'first_name', 'last_name'])

    const filters = await Promise.all([
      classroomFilters,
      categoryFilters,
      educationLanguageFilters,
      educationTypeFilters,
      educationSectionFilters,
      educationYearFilters,
      instructorsUsernames,
    ])

    filters[0].forEach((classroom) => {
      classroom.options.map((option) => {
        if (option.name === '*') {
          option.name = 'both'
        }
      })
    })

    return [
      ...filters[0],
      ...filters[1],
      ...filters[2],
      ...filters[3],
      ...filters[4],
      ...filters[5],
      {
        name: 'Instructor',
        value: 'instructors.id',
        options: filters[6].map((instructor) => {
          return {
            name: instructor.first_name + ' ' + instructor.last_name,
            value: instructor.id,
          }
        }),
        type: 'dropdown',
      },
    ]
  }

  public async classroom({ request, response }: HttpContextContract) {
    const { label } = await request.validate(ClassroomGetValidator)
    const classroom = await Classroom.query()
      .preload('instructor')
      .preload('tabs', (tabs) => tabs.preload('sections', (sections) => sections.preload('courses')))
      .preload('educationTypes')
      .preload('educationYears')
      .preload('educationSections')
      .preload('educationLanguages')
      .where('label', label)
      .firstOrFail()
    return Http.respond(response, 'classrooms', classroom)
  }

  public async enrolled({ request, response }: HttpContextContract) {
    const { classroomId, page, perPage, query, sortBy, from, to, filters } = await request.validate(ClassroomEnrolledValidation)
    const classroom = await Classroom.find(classroomId)
    if (!classroom) {
      throw new ResourceNotFoundException('Classroom does not exist')
    }
    const enrolledQuery = EnrollClassroom.query().preload('user').where('classroom_id', classroomId)
    const searchColumns = []
    ControllersUtils.applyAllQueryUtils(enrolledQuery, from, to, filters, sortBy, searchColumns, query)
    const enrolledClassroom = await enrolledQuery.paginate(page, perPage)
    return Http.respond(response, 'enrolled classroom', enrolledClassroom.toJSON().data || [], enrolledClassroom.toJSON().meta)
  }

  public async createClassroom({ request, response, auth }: HttpContextContract) {
    const { educationLanguages, educationSections, educationTypes, educationYears, ...classroomRequestObject } = await request.validate(
      ClassroomCreateValidator
    )
    const classroom = await Classroom.create(classroomRequestObject)
    await Promise.all([
      classroom.related('educationLanguages').attach(educationLanguages),
      classroom.related('educationTypes').attach(educationTypes),
      classroom.related('educationYears').attach(educationYears),
    ])
    if (educationSections?.length) await classroom.related('educationSections').attach(educationSections)
    await Admin.logAction(auth.id, 'create classroom', 'create_classroom', `Create new classroom ${classroom.title}`)
    return Http.respond(response, 'classrooms', classroom)
  }

  public async updateClassroom({ request, response, auth }: HttpContextContract) {
    const { educationLanguages, educationSections, educationTypes, educationYears, ...classroomRequestObject } = await request.validate(
      ClassroomUpdateValidator
    )
    if (classroomRequestObject.label === '') {
      throw new CustomException('label must not be empty', 422)
    }
    const classroom = await Classroom.query().where('id', classroomRequestObject.id).firstOrFail()
    await classroom.merge(classroomRequestObject).save()
    if (educationLanguages) classroom.related('educationLanguages').sync(educationLanguages)
    if (educationSections) classroom.related('educationSections').sync(educationSections)
    if (educationTypes) classroom.related('educationTypes').sync(educationTypes)
    if (educationYears) classroom.related('educationYears').sync(educationYears)
    await Admin.logAction(auth.id, 'update classroom', 'update_classroom', `Update classroom ${classroom.title}`)
    return Http.respond(response, 'updated', classroom)
  }

  public async deleteClassroom({ request, response, auth }: HttpContextContract) {
    const { label } = await request.validate(ClassroomGetValidator) // delete validator is same as get
    const classroom = await Classroom.query().where('label', label).firstOrFail()
    await classroom.delete()
    await Admin.logAction(auth.id, 'delete classroom', 'delete_classroom', `Deleted classroom ${classroom.title}`)
    return Http.respond(response, 'deleted', classroom)
  }

  public async updateCurriculum({ request, response }: HttpContextContract) {
    const payload = await request.validate(ClassroomUpdateCurriculum)

    let tabs: { id: number, order: number }[] = []
    let sections: { id: number, order: number, classroom_tab_id: number }[] = []
    let courses: { id: number, order: number, section_id: number }[] = []

    payload.tabs.map(tab => {
      tabs.push({ id: tab.id, order: tab.order })
      tab.sections?.map(section => {
        sections.push({id: section.id, order: section.order, classroom_tab_id: section.classroom_tab_id})
        if(section.courses) courses.push(...section.courses)
      })
    })
    await Promise.all([
      tabs.map(async tab => {
        await ClassroomTab.query().update({ order: tab.order }).where('id', tab.id)
      }),
      sections.map(async section => {
        await Section.query().update({ order: section.order, classroom_tab_id: section.classroom_tab_id }).where('id', section.id)
      }),
      courses.map(async course => {
        await Course.query().update({ order: course.order, section_id: course.section_id }).where('id', course.id)
      })
    ])

    return Http.respond(response, 'updated curriculum')
  }
}
