import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Import extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public description: string

  @column()
  public status: string

  @column()
  public importedData: string

  @column()
  public successData: string

  @column()
  public failedData: string

  @column()
  public importedCount: number

  @column()
  public successCount: number

  @column()
  public failedCount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
