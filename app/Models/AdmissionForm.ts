import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Question from './Question'
import Classroom from './Classroom'

export default class AdmissionForm extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships
  @manyToMany(() => Question, {
    pivotTable: 'form_questions',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'admission_form_id',
    pivotRelatedForeignKey: 'question_id',
    pivotColumns: ['admission_form_id', 'question_id', 'order'],
    pivotTimestamps: true,
  })
  questions: ManyToMany<typeof Question>

  @hasOne(() => Classroom, { foreignKey: 'admission_form_id' })
  public classroom: HasOne<typeof Classroom>
}
