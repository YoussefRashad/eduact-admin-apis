import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import EducationSection from './EducationSection'

export default class EducationYear extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships
  @manyToMany(() => EducationSection, {
    pivotTable: 'education_year_sections',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'education_year_id',
    pivotRelatedForeignKey: 'education_section_id',
  })
  public educationSections: ManyToMany<typeof EducationSection>
}
