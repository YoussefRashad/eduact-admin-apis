import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Admin from './Admin'

export default class AdminRole extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public admin_id: number

  @column()
  public role_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Admin, { localKey: 'admin_id', foreignKey: 'id' })
  public admin: BelongsTo<typeof Admin>
}
