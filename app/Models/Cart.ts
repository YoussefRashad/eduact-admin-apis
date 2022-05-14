import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public student_id: number

  @column()
  public amount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Student, { localKey: 'student_id', foreignKey: 'user_id' })
  public student: BelongsTo<typeof Student>
}
