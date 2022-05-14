import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'

export default class TrustedDevice extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public device_uuid: string

  @column()
  public device: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @hasOne(() => Student)
  public student: HasOne<typeof Student>
}
