import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BulkMessagesHistory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public description: string

  @column()
  public status: string

  @column()
  public via: string

  @column()
  public subject: string

  @column()
  public content: string

  @column()
  public sentToData: string

  @column()
  public successData: string

  @column()
  public failedData: string

  @column()
  public sentToCount: number

  @column()
  public successCount: number

  @column()
  public failedCount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
