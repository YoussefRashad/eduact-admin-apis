import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Classroom from './Classroom'
import Section from './Section'

export default class ClassroomTab extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public order: number

  @column()
  public classroom_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Classroom)
  classroom: BelongsTo<typeof Classroom>

  @hasMany(() => Section)
  public sections: HasMany<typeof Section>
}
