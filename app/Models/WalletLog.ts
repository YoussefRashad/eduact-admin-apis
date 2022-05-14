import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Invoice from 'App/Models/Invoice'

export default class WalletLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public old_amount: number

  @column()
  public amount: number

  @column()
  public new_amount: number

  @column()
  public description: string

  @column()
  public user_id: number

  @column()
  public invoice_id: number

  @column()
  public timestamp: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User)
  public student: BelongsTo<typeof User>

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>
}
