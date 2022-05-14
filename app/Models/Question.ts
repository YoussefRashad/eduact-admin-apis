import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import AdmissionForm from './AdmissionForm'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public question: string

  @column()
  public type: string

  @column()
  public options: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => AdmissionForm, {
    pivotTable: 'form_questions',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'question_id',
    pivotRelatedForeignKey: 'admission_form_id',
    pivotColumns: ['admission_form_id', 'question_id', 'order'],
    pivotTimestamps: true,
  })
  admissionForms: ManyToMany<typeof AdmissionForm>
}
