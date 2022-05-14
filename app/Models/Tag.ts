import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from './TestQuestion'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public theme: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => TestQuestion, {
    pivotTable: 'test_question_tags',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'test_question_id',
    pivotTimestamps: true,
  })
  public testQuestionTags: ManyToMany<typeof TestQuestion>
}
