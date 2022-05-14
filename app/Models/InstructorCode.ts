import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class InstructorCode extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public studentId: number

  @column()
  public instructorId: number

  @column()
  public code: string

  @column()
  public instructor_name: string

  @column()
  public unit_name: string

  @column()
  public max_score: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
