import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Address from 'App/Models/Address'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'
import Cart from 'App/Models/Cart'
import Ip from 'App/Models/Ip'
import TrustedDevice from 'App/Models/TrustedDevice'
import Invoice from 'App/Models/Invoice'
import Classroom from 'App/Models/Classroom'
import Course from 'App/Models/Course'
import Scratchcard from './Scratchcard'
import RechargeCard from './RechargeCard'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public education_type_id: number

  @column()
  public education_language_id: number

  @column()
  public education_section_id: number

  @column()
  public education_year_id: number

  @column()
  public school: string

  @column()
  public ssn: string

  @column()
  public parent1_relation: string

  @column()
  public parent1_phone: string

  @column()
  public parent2_relation: string

  @column()
  public parent2_phone: string

  @column()
  public profile_complete: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @hasOne(() => Address, { foreignKey: 'user_id' })
  public address: HasOne<typeof Address>

  @hasOne(() => Wallet, { foreignKey: 'user_id' })
  public wallet: HasOne<typeof Wallet>

  @hasMany(() => Ip, { foreignKey: 'user_id' })
  public ips: HasMany<typeof Ip>

  @hasMany(() => TrustedDevice, { foreignKey: 'user_id' })
  public trusted_devices: HasMany<typeof TrustedDevice>

  @hasMany(() => Invoice, { localKey: 'user_id', foreignKey: 'user_id' })
  public invoices: HasMany<typeof Invoice>

  @hasMany(() => Scratchcard, { localKey: 'user_id', foreignKey: 'user_id' })
  public cards: HasMany<typeof Scratchcard>

  @hasMany(() => RechargeCard, { localKey: 'user_id', foreignKey: 'user_id' })
  public recharge_cards: HasMany<typeof RechargeCard>

  @manyToMany(() => Classroom, {
    pivotTable: 'enroll_classrooms',
    relatedKey: 'id',
    localKey: 'user_id',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'classroom_id',
    pivotColumns: ['active', 'created_at', 'updated_at'],
    pivotTimestamps: true,
  })
  public classrooms: ManyToMany<typeof Classroom>

  @manyToMany(() => Course, {
    pivotTable: 'enroll_courses',
    localKey: 'user_id',
    relatedKey: 'id',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'course_id',
    pivotColumns: ['purchase_method', 'created_at', 'updated_at'],
    pivotTimestamps: true,
  })
  public courses: ManyToMany<typeof Course>

  // custom queries
  public static async update_(userInstance: User, studentObj) {
    const { student, instructor, address, ...user } = studentObj
    await userInstance.merge(user).save()
    const studentInstance = await Student.query().where('user_id', userInstance.id).firstOrFail()
    await studentInstance
      .merge({
        ...student,
        education_section_id: student?.education_section_id ? student.education_section_id : null,
      })
      .save()
    const addressInstance = await Address.query().where('user_id', userInstance.id).first()
    if (addressInstance) {
      await addressInstance.merge(address).save()
    } else {
      await Address.create({ user_id: userInstance.id, ...address })
    }
  }
}
