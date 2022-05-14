import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasOne, HasOne, hasMany, HasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Instructor from 'App/Models/Instructor'
import Student from 'App/Models/Student'
import WalletLog from 'App/Models/WalletLog'
import TimeLineLog from 'App/Models/TimeLineLog'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import Wallet from 'App/Models/Wallet'
import Course from './Course'
import Ip from './Ip'
import Classroom from 'App/Models/Classroom'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public phone_number: string

  @column()
  public first_name: string

  @column()
  public middle_name: string

  @column()
  public last_name: string

  @column()
  public gender: string

  @column()
  public profile_photo: string

  @column()
  public birth_date: DateTime

  @column()
  public password_reset_token: string

  @column()
  public email_verified: boolean

  @column()
  public phone_verified: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @hasOne(() => Instructor, { foreignKey: 'user_id' })
  public instructor: HasOne<typeof Instructor>

  @hasOne(() => Student, { foreignKey: 'user_id' })
  public student: HasOne<typeof Student>

  @hasMany(() => WalletLog, { foreignKey: 'user_id' })
  public wallet_logs: HasMany<typeof WalletLog>

  @hasMany(() => TimeLineLog, { foreignKey: 'user_id' })
  public timeline_logs: HasMany<typeof TimeLineLog>

  @hasMany(() => Ip, { foreignKey: 'user_id' })
  public ips: HasMany<typeof Ip>

  @manyToMany(() => Course, {
    pivotTable: 'enroll_courses',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'course_id',
    pivotColumns: ['created_at', 'purchase_method'],
  })
  public courses: ManyToMany<typeof Course>

  @manyToMany(() => Classroom, {
    pivotTable: 'enroll_classrooms',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'classroom_id',
    pivotColumns: ['created_at', 'active'],
  })
  public classrooms: ManyToMany<typeof Classroom>

  // custom queries
  /**
   * gets student data with wallet relationship preloaded
   */
  public static async getStudentBasicInfo(field, value): Promise<{ user: User; student: Student; wallet: Wallet }> {
    const user = await User.query()
      .has('student')
      .preload('student', (studentQuery) => studentQuery.has('wallet').preload('wallet'))
      .where(field, value)
      .first()
    if (!user) throw new ResourceNotFoundException('student not found')
    const student = user.student
    const wallet = student.wallet
    return { user, student, wallet }
  }

  // hooks
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
