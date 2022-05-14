import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, belongsTo, BelongsTo, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Transaction from 'App/Models/Transaction'
import Student from 'App/Models/Student'
import Course from 'App/Models/Course'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public transaction_id: number

  @column()
  public user_id: number

  @column()
  public invoice_ref: string

  @column()
  public total_price: number

  @column()
  public discount: number

  @column()
  public type: string

  @column()
  public status: string

  @column()
  public price: number

  @column()
  public tax: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @hasOne(() => Transaction, { localKey: 'transaction_id', foreignKey: 'id' })
  public transaction: HasOne<typeof Transaction>

  @belongsTo(() => Student, { localKey: 'user_id', foreignKey: 'user_id' })
  public student: BelongsTo<typeof Student>

  @manyToMany(() => Course, {
    pivotTable: 'invoice_items',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'invoice_id',
    pivotRelatedForeignKey: 'course_id',
  })
  public courses: ManyToMany<typeof Course>
}
