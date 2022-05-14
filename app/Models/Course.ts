import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'
import Classroom from 'App/Models/Classroom'
import Unit from 'App/Models/Unit'
import Section from './Section'
import CoursePrerequisite from './CoursePrerequisite'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public classroom_id: number

  @column()
  public sectionId: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public price: number

  @column()
  public old_price: number | null

  @column()
  public code: string

  @column()
  public active: boolean

  @column()
  public thumbnail: string

  @column()
  public scores_view: boolean

  @column()
  public buyable: boolean

  @column()
  public order: number

  @column()
  public preview_url: string

  @column()
  public capacity: number

  @column()
  public payment_methods_allowed: string

  @column()
  public expired: boolean

  @column.dateTime()
  public expiry_date: DateTime

  @column()
  public expiry_period: number

  @column.dateTime()
  public active_start_date: DateTime

  @column.dateTime()
  public active_end_date: DateTime

  @column.dateTime()
  public buy_start_date: DateTime

  @column.dateTime()
  public buy_end_date: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @manyToMany(() => Student, {
    pivotTable: 'enroll_courses',
    localKey: 'id',
    relatedKey: 'user_id',
    pivotForeignKey: 'course_id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['created_at', 'purchase_method'],
  })
  public students: ManyToMany<typeof Student>

  @belongsTo(() => Classroom, { foreignKey: 'classroom_id' })
  public classroom: BelongsTo<typeof Classroom>

  @belongsTo(() => Section)
  public section: BelongsTo<typeof Section>

  @hasMany(() => Unit, { foreignKey: 'course_id' })
  public units: HasMany<typeof Unit>

  @hasMany(() => CoursePrerequisite, { foreignKey: 'course_id' })
  public course_prerequisites: HasMany<typeof CoursePrerequisite>

  @manyToMany(() => Course, {
    pivotTable: 'course_prerequisites',
    localKey: 'id',
    pivotForeignKey: 'course_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'prerequisite',
    pivotColumns: ['path'],
  })
  public prerequisites: ManyToMany<typeof Course>
}
