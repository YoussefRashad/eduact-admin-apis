import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany, hasMany, HasMany, computed } from '@ioc:Adonis/Lucid/Orm'
import Instructor from 'App/Models/Instructor'
import Student from 'App/Models/Student'
import Category from 'App/Models/Category'
import ClassroomTab from './ClassroomTab'
import EducationLanguage from './EducationLanguage'
import EducationSection from './EducationSection'
import EducationType from './EducationType'
import EducationYear from './EducationYear'
import Course from './Course'
import AdmissionForm from './AdmissionForm'
import Section from './Section'

export default class Classroom extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public instructor_id: number

  @column()
  public category_id: number

  @column()
  public current_course: number

  @column()
  public title: string

  @column()
  public label: string

  @column()
  public type: string

  @column()
  public sub_type: string

  @column()
  public description: string

  @column()
  public enrolled_count: number

  @column()
  public language: string

  @column()
  public thumbnail: string

  @column()
  public status: string

  @column()
  public active: boolean

  @column()
  public accessible: boolean

  @column()
  public weight: number

  @column()
  public has_admission: boolean

  @column()
  public admission_status: boolean

  @column()
  public admission_form_id: number

  @column()
  public payment_methods_allowed: string

  @column()
  public code: string

  @column()
  public rating: number

  @column()
  public rating_count: number

  @column()
  public prerequisites: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Section)
  public section: HasMany<typeof Section>

  // relationships
  @belongsTo(() => Instructor, { foreignKey: 'instructor_id' })
  instructor: BelongsTo<typeof Instructor>

  @manyToMany(() => Student, {
    relatedKey: 'user_id',
    pivotTable: 'enroll_classrooms',
    pivotForeignKey: 'classroom_id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['classroom_id', 'user_id', 'active'],
    pivotTimestamps: true,
  })
  students: ManyToMany<typeof Student>

  @belongsTo(() => Category, { foreignKey: 'category_id' })
  category: BelongsTo<typeof Category>

  @hasMany(() => ClassroomTab, { foreignKey: 'classroom_id' })
  public tabs: HasMany<typeof ClassroomTab>

  @manyToMany(() => EducationLanguage, {
    pivotTable: 'classroom_education_languages',
    localKey: 'id',
    pivotForeignKey: 'classroom_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'education_language_id',
    pivotTimestamps: true,
  })
  public educationLanguages: ManyToMany<typeof EducationLanguage>

  @manyToMany(() => EducationSection, {
    pivotTable: 'classroom_education_sections',
    localKey: 'id',
    pivotForeignKey: 'classroom_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'education_section_id',
    pivotTimestamps: true,
  })
  public educationSections: ManyToMany<typeof EducationSection>

  @manyToMany(() => EducationType, {
    pivotTable: 'classroom_education_types',
    localKey: 'id',
    pivotForeignKey: 'classroom_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'education_type_id',
    pivotTimestamps: true,
  })
  public educationTypes: ManyToMany<typeof EducationType>

  @manyToMany(() => EducationYear, {
    pivotTable: 'classroom_education_years',
    localKey: 'id',
    pivotForeignKey: 'classroom_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'education_year_id',
    pivotTimestamps: true,
  })
  public educationYears: ManyToMany<typeof EducationYear>

  @hasMany(() => Course, { foreignKey: 'classroom_id' })
  public courses: HasMany<typeof Course>

  @belongsTo(() => AdmissionForm, { foreignKey: 'id', localKey: 'admission_form_id' })
  admissionForm: BelongsTo<typeof AdmissionForm>

  @computed()
  public get pivot() {
    return this.$extras
  }
}
