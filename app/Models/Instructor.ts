import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Classroom from 'App/Models/Classroom'
import Utils from 'App/Utils/Utils'
import EducationLanguage from './EducationLanguage'
import EducationSection from './EducationSection'
import EducationType from './EducationType'
import EducationYear from './EducationYear'
import InstructorCode from './InstructorCode'

export default class Instructor extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public label: string

  @column()
  public rating: number

  @column()
  public rating_count: number

  @column()
  public bio: string

  @column()
  public fb_link: string

  @column()
  public youtube_link: string

  @column()
  public linkedin_link: string

  @column()
  public website_link: string

  @column()
  public weight: string

  @column()
  public is_active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @hasMany(() => Classroom, { localKey: 'user_id', foreignKey: 'instructor_id' })
  public classrooms: HasMany<typeof Classroom>

  @manyToMany(() => EducationLanguage, {
    pivotTable: 'instructor_education_languages',
    localKey: 'user_id',
    relatedKey: 'id',
    pivotForeignKey: 'instructor_id',
    pivotRelatedForeignKey: 'education_language_id',
    pivotTimestamps: true,
  })
  public educationLanguages: ManyToMany<typeof EducationLanguage>

  @manyToMany(() => EducationSection, {
    pivotTable: 'instructor_education_sections',
    localKey: 'user_id',
    relatedKey: 'id',
    pivotForeignKey: 'instructor_id',
    pivotRelatedForeignKey: 'education_section_id',
    pivotTimestamps: true,
  })
  public educationSections: ManyToMany<typeof EducationSection>

  @manyToMany(() => EducationType, {
    pivotTable: 'instructor_education_types',
    localKey: 'user_id',
    relatedKey: 'id',
    pivotForeignKey: 'instructor_id',
    pivotRelatedForeignKey: 'education_type_id',
    pivotTimestamps: true,
  })
  public educationTypes: ManyToMany<typeof EducationType>

  @manyToMany(() => EducationYear, {
    pivotTable: 'instructor_education_years',
    localKey: 'user_id',
    relatedKey: 'id',
    pivotForeignKey: 'instructor_id',
    pivotRelatedForeignKey: 'education_year_id',
    pivotTimestamps: true,
  })
  public educationYears: ManyToMany<typeof EducationYear>

  @hasMany(() => InstructorCode)
  public codes: HasMany<typeof InstructorCode>

  // custom queries
  public static async create_(instructorObj) {
    const { instructor, ...user } = instructorObj
    const { educationLanguages, educationSections, educationTypes, educationYears, ...instructorData } = instructor
    user.uuid = Utils.generateUUID()
    user.username = Utils.generateUsername(user.first_name, user.last_name)
    const newUser = await User.create({ ...user, phone_verified: true })
    const newInstructor = await newUser.related('instructor').create(instructor)
    await newUser.load('instructor')
    if (educationLanguages) newInstructor.related('educationLanguages').sync(educationLanguages)
    if (educationSections) newInstructor.related('educationSections').sync(educationSections)
    if (educationTypes) newInstructor.related('educationTypes').sync(educationTypes)
    if (educationYears) newInstructor.related('educationYears').sync(educationYears)
    return newUser
  }

  public static async update_(userInstance, instructorObj) {
    const { instructor, ...user } = instructorObj
    const { educationLanguages, educationSections, educationTypes, educationYears, ...instructorData } = instructor
    await userInstance.merge(user).save()
    const newInstructor = await Instructor.findByOrFail('user_id', userInstance.id)
    await newInstructor.merge(instructorData).save()

    if (educationLanguages) newInstructor.related('educationLanguages').sync(educationLanguages)
    if (educationSections) newInstructor.related('educationSections').sync(educationSections)
    if (educationTypes) newInstructor.related('educationTypes').sync(educationTypes)
    if (educationYears) newInstructor.related('educationYears').sync(educationYears)
  }
}
