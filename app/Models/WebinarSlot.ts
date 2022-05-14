import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Webinar from './Webinar';

export default class WebinarSlot extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public webinar_id: number

  @column.dateTime()
  public startTime: DateTime

  @column.dateTime()
  public endTime: DateTime

  @column()
  public capacity: number

  @column()
  public duration: number

  @column()
  public description: string

  @column()
  public slotUrl: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Webinar, { foreignKey: 'webinar_id' })
  public webinar: BelongsTo<typeof Webinar>
}
