import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Course from 'App/Models/Course'
import Video from './Video'
import UnitType from './UnitType'
import Document from './Document'
import WebContent from './WebContent'
import Webinar from './Webinar';

export default class Unit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public course_id: number

  @column()
  public name: string

  @column()
  public type_id: number

  @column()
  public order: number

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @belongsTo(() => Course, { foreignKey: 'course_id' })
  public course: BelongsTo<typeof Course>

  @belongsTo(() => UnitType, { foreignKey: 'type_id' })
  unitType: BelongsTo<typeof UnitType>

  @hasOne(() => Document)
  document: HasOne<typeof Document>

  @hasOne(() => Webinar)
  webinar: HasOne<typeof Webinar>

  @hasOne(() => Video)
  video: HasOne<typeof Video>

  @hasOne(() => WebContent)
  content: HasOne<typeof WebContent>

  @beforeCreate()
  public static async addName(data) {
    if (!data.name) {
      let id = 1
      const last = await Unit.query().orderBy('id', 'desc').first()!
      if(last) id = last.id
      data.name = 'unit ' + (id + 1)
    }
  }
}
