import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Unit from './Unit';
import WebinarSlot from './WebinarSlot';

export default class Webinar extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public unit_id: number

  @column()
  public name: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Unit, { foreignKey: 'unit_id' })
  public unit: BelongsTo<typeof Unit>

  @hasMany(() => WebinarSlot, { foreignKey: 'webinar_id' })
  public webinarSlots: HasMany<typeof WebinarSlot>
}
