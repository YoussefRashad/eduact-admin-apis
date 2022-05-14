import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from './TestQuestion'
export default class DragDropQuestionOption extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public gap: number | null

  @column()
  public value: string

  @column()
  public testQuestionId: number

  @belongsTo(() => TestQuestion)
  testQuestion: BelongsTo<typeof TestQuestion>
}
