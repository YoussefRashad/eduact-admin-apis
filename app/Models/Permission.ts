import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany, ManyToMany, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import PermissionGroup from './PermissionGroup'

export default class Permission extends BaseModel {
  // public serializeExtras = true    // TODO: check serializing extras on relationships

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public code: string

  @column()
  public description: string

  @column()
  public active: boolean

  @column()
  public group_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @manyToMany(() => Role, {
    pivotTable: 'role_permissions',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'permission_id',
    pivotRelatedForeignKey: 'role_id',
    pivotTimestamps: true,
  })
  public permission_roles: ManyToMany<typeof Role>

  @belongsTo(() => PermissionGroup, { foreignKey: 'group_id' })
  public permission_group: BelongsTo<typeof PermissionGroup>
}
