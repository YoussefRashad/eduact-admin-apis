import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'

export default class TestModelQuestion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public test_model_id: number

  @column()
  public test_question_id: number

  @column()
  public order: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
