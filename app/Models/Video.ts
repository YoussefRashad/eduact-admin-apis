import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Unit from './Unit'

export default class Video extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public unitId: number

  @column()
  public duration: number

  @column()
  public name: string

  @column()
  public uri: string

  @column()
  public provider: string

  @column()
  public providerVideoId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Unit)
  public unit: BelongsTo<typeof Unit>
}
