import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Course from 'App/Models/Course'
import Classroom from 'App/Models/Classroom'
import Student from 'App/Models/Student'

export default class Scratchcard extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public course_id: number

  @column()
  public code: string

  @column()
  public batch: number

  @column()
  public classroom_id: number

  @column()
  public serial: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Course, { foreignKey: 'course_id' })
  public course: BelongsTo<typeof Course>

  @belongsTo(() => Classroom, { foreignKey: 'classroom_id' })
  public classroom: BelongsTo<typeof Classroom>

  @belongsTo(() => Student, { foreignKey: 'user_id', localKey: 'user_id' })
  public student: BelongsTo<typeof Student>
}
