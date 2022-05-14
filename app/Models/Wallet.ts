import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public amount: number

  @column()
  public currency: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>
}
