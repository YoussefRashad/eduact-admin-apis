import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import TestQuestion from 'App/Models/TestQuestion'
import Utils from 'App/Utils/Utils'
import GradeScheme from './GradeScheme'
import Unit from './Unit'
import TestModel from './TestModel'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public unit_id: number

  @column()
  public active: boolean

  @column()
  public duration: number

  @column()
  public overallScore: number

  @column()
  public passingValue: number

  @column()
  public allowedTrials: number

  @column()
  public uuid: string

  @column()
  public title: string

  @column()
  public startText: string

  @column()
  public endText: string

  @column()
  public messageIfPassed: string

  @column()
  public messageIfFailed: string

  @column()
  public passingUnit: string

  @column()
  public allowRepetitionWhen: string

  @column()
  public modelMode: string

  @column()
  public viewMode: string

  @column()
  public shuffleQuestion: boolean

  @column()
  public shuffleAnswers: boolean

  @column()
  public showCorrectIfPassed: boolean

  @column()
  public showCorrectIfFailed: boolean

  @column()
  public showScorePercentage: boolean

  @column()
  public showScoreValue: boolean

  @column()
  public showGrade: boolean

  @column()
  public allowMovement: boolean

  @column.dateTime()
  public activeStartDate: DateTime | null

  @column.dateTime()
  public activeEndDate: DateTime | null

  @hasMany(() => TestQuestion, { foreignKey: 'test_id' })
  public questions: HasMany<typeof TestQuestion>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => TestModel, { foreignKey: 'test_id' })
  public testModels: HasMany<typeof TestModel>

  @hasMany(() => GradeScheme)
  public gradeSchema: HasMany<typeof GradeScheme>

  @belongsTo(() => Unit, { foreignKey: 'unit_id' })
  public unit: BelongsTo<typeof Unit>

  @beforeCreate()
  public static async assignUuidAndName(test: Test) {
    test.uuid = Utils.generateUUID()
    if (!test.title) {
      let id = 1
      let last = await Test.query().orderBy('id', 'desc').first()
      if(last) id = last.id
      test.title = 'test ' + (id + 1)
    }
  }
}
