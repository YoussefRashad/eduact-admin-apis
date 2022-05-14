import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Classroom from './Classroom'
import Student from './Student'

export default class EnrollClassroom extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public classroom_id: number

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Student, { foreignKey: 'user_id' })
  public student: BelongsTo<typeof Student>

  @belongsTo(() => Classroom, { foreignKey: 'classroom_id' })
  public classroom: BelongsTo<typeof Classroom>
}
