import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Student from 'App/Models/Student'
import Governorate from './Governorate'
import City from './City'

export default class Address extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public user_id: number

  @column()
  public building_number: string

  @column()
  public floor: string

  @column()
  public apartment: string

  @column()
  public street: string

  @column()
  public governorate: number

  @column()
  public city: number

  @column()
  public country: string

  @column()
  public postal_code: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Student, { localKey: 'user_id', foreignKey: 'user_id' })
  public student: BelongsTo<typeof Student>

  @hasOne(() => Governorate, { localKey: 'governorate', foreignKey: 'id' })
  public governorate_relation: HasOne<typeof Governorate>

  @hasOne(() => City, { localKey: 'city', foreignKey: 'id' })
  public city_relation: HasOne<typeof City>
}
