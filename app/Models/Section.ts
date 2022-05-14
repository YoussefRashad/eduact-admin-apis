import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Course from './Course'
import ClassroomTab from './ClassroomTab'
import Classroom from './Classroom'

export default class Section extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public order: number

  @column()
  public classroomTabId: number

  @column()
  public classroom_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => ClassroomTab)
  classroomTab: BelongsTo<typeof ClassroomTab>

  @belongsTo(() => Classroom)
  classroom: BelongsTo<typeof Classroom>

  @hasMany(() => Course)
  public courses: HasMany<typeof Course>
}
