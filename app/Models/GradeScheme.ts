import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Test from './Test'

export default class GradeScheme extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public from: number

  @column()
  public to: number

  @column()
  public testId: number

  @column()
  public grade: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Test)
  public test: BelongsTo<typeof Test>
}
