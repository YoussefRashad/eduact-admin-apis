import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Permission from './Permission'
import Admin from './Admin'

export default class Role extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationships
  @manyToMany(() => Admin, {
    pivotTable: 'admin_roles',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'admin_id',
    pivotTimestamps: true,
  })
  public admins: ManyToMany<typeof Admin>

  @manyToMany(() => Permission, {
    pivotTable: 'role_permissions',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'permission_id',
    pivotTimestamps: true,
  })
  public permissions: ManyToMany<typeof Permission>
}
