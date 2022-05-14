import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public transaction_ref: string

  @column()
  public provider: string

  @column()
  public provider_ref: string

  @column()
  public method: string

  @column()
  public status: string

  @column()
  public amount: number

  @column({ serializeAs: 'expiry_date' })
  public expiryDate: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
