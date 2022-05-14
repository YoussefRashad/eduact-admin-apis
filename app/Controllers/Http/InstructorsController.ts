import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import Instructor from 'App/Models/Instructor'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import User from 'App/Models/User'
import InstructorFindValidator from 'App/Validators/InstructorValidators/InstructorFindValidator'
import InstructorCreateValidator from 'App/Validators/InstructorValidators/InstructorCreateValidator'
import InstructorUpdateValidator from 'App/Validators/InstructorValidators/InstructorUpdateValidator'
import Admin from 'App/Models/Admin'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import RequireIDValidator from 'App/Validators/RequireIDValidator'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import Classroom from 'App/Models/Classroom'
import EducationLanguage from 'App/Models/EducationLanguage'
import EducationType from 'App/Models/EducationType'
import EducationSection from 'App/Models/EducationSection'
import EducationYear from 'App/Models/EducationYear'

export default class InstructorsController {
  public async getInstructors({ request, response }: HttpContextContract) {
    const { page, perPage, from, to, sortBy, query, filters } = await request.validate(new GeneralAllValidator())

    const gender = filters?.find((filter) => filter.gender)
    const is_active = filters
      ?.map((filter) => {
        return filter.is_active === true ? filter.is_active : filter.is_active === false ? filter.is_active : null
      })
      .filter((val) => val !== null)[0]

    const education_language = filters?.find((filter) => filter['education_languages.id'])
    const education_section = filters?.find((filter) => filter['education_sections.id'])
    const education_type = filters?.find((filter) => filter['education_types.id'])
    const education_year = filters?.find((filter) => filter['education_years.id'])

    const instructorQuery = User.query().join('instructors', 'id', 'user_id')

    const searchColumns = ['users.first_name', 'users.last_name', 'instructors.label']
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'instructors.' + sortBy.field : sortBy.field
    }

    ControllersUtils.applyAllQueryUtils(instructorQuery, from, to, null, sortBy, searchColumns, query, 'instructors')

    instructorQuery.if(gender, (query) => query.where('gender', gender.gender))
    instructorQuery.whereHas('instructor', (query) => {
      query.if(is_active !== undefined, (query) => {
        query.where('is_active', is_active)
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

    const instructors = await instructorQuery
      .preload('instructor', (instructorQuery) => {
        instructorQuery.preload('educationSections').preload('educationYears')
      })
      .paginate(page, perPage)
    const filterData = await this.fetchInstructorFilters()
    return Http.respond(response, 'instructors', instructors.toJSON().data, instructors.toJSON().meta, filterData)
  }

  public async fetchInstructorFilters() {
    const userFilters = new DataFilter({
      model: User,
      filterObjects: [
        {
          name: 'Gender',
          value: 'gender',
          optionNameColumn: 'gender',
          optionValueColumn: 'gender',
        },
      ],
    }).process()
    const instructorFilters = new DataFilter({
      model: Instructor,
      filterObjects: [
        {
          name: 'Active',
          value: 'is_active',
          optionNameColumn: 'is_active',
          optionValueColumn: 'is_active',
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
      userFilters,
      instructorFilters,
      educationLanguageFilters,
      educationTypeFilters,
      educationSectionFilters,
      educationYearFilters,
    ])

    return [...filters[0], ...filters[1], ...filters[2], ...filters[3], ...filters[4], ...filters[5]]
  }

  public async getInstructor({ request, response }: HttpContextContract) {
    const { uuid } = await request.validate(new InstructorFindValidator())
    const instructor = await User.query()
      .where('uuid', uuid)
      .preload('instructor', (query) =>
        query.preload('classrooms').preload('educationLanguages').preload('educationYears').preload('educationTypes').preload('educationSections')
      ).firstOrFail()
    return Http.respond(response, 'instructor', instructor)
  }

  // FIXME: password is to long for var(60) as Hash.make() method return a hashed string with size 72 not 60
  // FIXME: updated the staging database to size 72 **without migration**
  public async createInstructor({ request, response, auth }: HttpContextContract) {
    const requestBody = await request.validate(new InstructorCreateValidator())
    const instructor = await Instructor.create_(requestBody)
    await Admin.logAction(auth.id, 'create instructor', 'create_instructor', `Create new instructor ${instructor.username}`)
    return Http.respond(response, 'instructor', instructor)
  }

  public async updateInstructor({ request, response, auth }: HttpContextContract) {
    const requestBody = await request.validate(new InstructorUpdateValidator())
    let user: User
    try {
      user = await User.query().has('instructor').where('uuid', requestBody.uuid).firstOrFail()
    } catch (error) {
      response.status(404).json({ message: 'no instructor found with the given uuid' })
      return
    }
    await Instructor.update_(user, requestBody)
    await user.load('instructor', (query) => query.preload('classrooms'))
    return Http.respond(response, 'updated')
  }

  public async activateInstructor({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const instructor = await Instructor.query().where('user_id', id).first()
    if (!instructor) {
      throw new ResourceNotFoundException('instructor not found')
    }
    instructor.is_active = true
    await instructor.save()
    await Classroom.query().where('instructor_id', instructor.user_id).update('active', true)
    return Http.respond(response, 'activated')
  }

  public async deactivateInstructor({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const instructor = await Instructor.query().where('user_id', id).first()
    if (!instructor) {
      throw new ResourceNotFoundException('instructor not found')
    }
    instructor.is_active = false
    await instructor.save()
    await Classroom.query().where('instructor_id', instructor.user_id).update('active', false)
    return Http.respond(response, 'deactivated')
  }
}
