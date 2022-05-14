import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class EnrollCourse extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public course_id: number

  @column()
  public purchase_method: string

  @column()
  public expired: Boolean

  @column.dateTime({ autoCreate: true })
  public expire_at: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  // @computed()
  // public get extras(){
  //   return this.$extras
  // }
}
