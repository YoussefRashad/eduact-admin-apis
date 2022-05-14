import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'
import Governorate from './Governorate'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public governorate_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Governorate, { localKey: 'governorate_id', foreignKey: 'id' })
  public governorate: BelongsTo<typeof Governorate>
}
