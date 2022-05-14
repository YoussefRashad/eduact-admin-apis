import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from 'App/Models/TestQuestion'
import Test from './Test'

export default class TestModel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public test_id: number

  @column()
  public name: string

  @column()
  public shuffle_questions: boolean

  @column()
  public shuffle_answers: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Test, { foreignKey: 'test_id' })
  public test: BelongsTo<typeof Test>

  @manyToMany(() => TestQuestion, {
    pivotTable: 'test_model_questions',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'test_model_id',
    pivotRelatedForeignKey: 'test_question_id',
    pivotTimestamps: true,
  })
  public modelQuestions: ManyToMany<typeof TestQuestion>
}
