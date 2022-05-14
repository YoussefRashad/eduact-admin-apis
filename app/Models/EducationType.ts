import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import EducationLanguage from './EducationLanguage'
import EducationYear from './EducationYear'

export default class EducationType extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships

  @manyToMany(() => EducationLanguage, {
    pivotTable: 'education_type_languages',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'education_type_id',
    pivotRelatedForeignKey: 'education_language_id',
  })
  public educationLanguages: ManyToMany<typeof EducationLanguage>

  @manyToMany(() => EducationYear, {
    pivotTable: 'education_type_years',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'education_type_id',
    pivotRelatedForeignKey: 'education_year_id',
  })
  public educationYears: ManyToMany<typeof EducationYear>
}
