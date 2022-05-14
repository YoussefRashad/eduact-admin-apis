import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import MultipleChoiceQuestionOptions from './MultipleChoiceQuestionOptions'
import FillinTheGapQuestionOptions from './FillinTheGapQuestionOptions'
import OrderingQuestionOptions from './OrderingQuestionOptions'
import Tag from './Tag'
import Test from './Test'
import DragAndDropQuestionOption from './DragDropQuestionOption'
import MatchingQuestionOption from './MatchingQuestionOption'

export default class TestQuestion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public test_id: number

  @column()
  public parsedContent: string

  @column()
  public weight: number

  @column()
  public content: string

  @column()
  public type: string

  @column()
  public feedback: string

  @column()
  public order: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @manyToMany(() => Tag, {
    pivotTable: 'test_question_tags',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'test_question_id',
    pivotRelatedForeignKey: 'tag_id',
    pivotTimestamps: true,
  })
  public testQuestionTags: ManyToMany<typeof Tag>

  @hasMany(() => MultipleChoiceQuestionOptions, { foreignKey: 'test_question_id' })
  public multipleChoiceQuestions: HasMany<typeof MultipleChoiceQuestionOptions>

  @hasMany(() => FillinTheGapQuestionOptions, { foreignKey: 'test_question_id' })
  public fillInTheGapQuestions: HasMany<typeof FillinTheGapQuestionOptions>

  @hasMany(() => OrderingQuestionOptions, { foreignKey: 'test_question_id' })
  public orderingQuestions: HasMany<typeof OrderingQuestionOptions>

  @hasMany(() => DragAndDropQuestionOption)
  public dragAndDropOptions: HasMany<typeof DragAndDropQuestionOption>
    
  @hasMany(() => MatchingQuestionOption)
  public matchingOptions: HasMany<typeof MatchingQuestionOption>

  @belongsTo(() => Test, { foreignKey: 'test_id' })
  public test: BelongsTo<typeof Test>
}
