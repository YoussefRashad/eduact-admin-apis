import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from './TestQuestion'

export default class MatchingQuestionOption extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public testQuestionId: number

  @column()
  public value: string

  @column()
  public match: string

  @belongsTo(() => TestQuestion)
  public testQuestion: BelongsTo<typeof TestQuestion>
}
