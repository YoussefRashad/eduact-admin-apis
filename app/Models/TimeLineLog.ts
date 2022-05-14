import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class TimeLineLog extends BaseModel {
  public static table = 'timelines'

  @column({ isPrimary: true })
  public id: number

  @column()
  public event: string

  @column()
  public tag: string

  @column()
  public description: string

  @column()
  public user_id: number

  @column()
  public timestamp: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User)
  public student: BelongsTo<typeof User>
}
