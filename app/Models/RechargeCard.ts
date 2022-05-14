import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'

export default class RechargeCard extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public code: string

  @column()
  public batch: number

  @column()
  public value: number

  @belongsTo(() => Student, { foreignKey: 'user_id', localKey: 'user_id' })
  public student: BelongsTo<typeof Student>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
