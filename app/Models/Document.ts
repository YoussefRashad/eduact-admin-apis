import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Unit from './Unit'

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  unit_id: number

  @column()
  file_name: string

  @column()
  uri: string

  @column()
  size: number

  @column()
  extension: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Unit, { foreignKey: 'unit_id' })
  unit: BelongsTo<typeof Unit>
}
