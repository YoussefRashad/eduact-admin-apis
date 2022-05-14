import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Course from './Course'

export default class CoursePrerequisite extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: null })
  public course_id: number

  @column({ serializeAs: null })
  public prerequisite: number

  @column()
  public path: number

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Course, { foreignKey: 'course_id' })
  public course: BelongsTo<typeof Course>

  @belongsTo(() => Course, { foreignKey: 'prerequisite', serializeAs: 'course' })
  public prerequisite_course: BelongsTo<typeof Course>
}
