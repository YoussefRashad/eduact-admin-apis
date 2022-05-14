import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from './TestQuestion'

export default class OrderingQuestionOptions extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public test_question_id: number

  @column()
  public option: string

  @column()
  public order: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => TestQuestion, { foreignKey: 'test_question_id' })
  test_question: BelongsTo<typeof TestQuestion>
}