import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Response from './Response'
import AdmissionForm from './AdmissionForm'
import Student from './Student'
import User from './User'

export default class AdmissionFormResponse extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public admission_form_id: number

  @column()
  public student_id: number

  @column()
  public status: string = 'pending'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => AdmissionForm, { foreignKey: 'admission_form_id' })
  public admissionForm: BelongsTo<typeof AdmissionForm>

  @belongsTo(() => Student, { foreignKey: 'student_id' })
  public student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'student_id' })
  public user: BelongsTo<typeof User>

  @hasMany(() => Response, { foreignKey: 'admission_form_response_id' })
  public responses: HasMany<typeof Response>
}
