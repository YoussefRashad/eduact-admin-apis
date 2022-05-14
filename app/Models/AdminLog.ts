import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AdminLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public event: string

  @column()
  public tag: string

  @column()
  public description: string

  @column()
  public admin_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // custom queries
  public static async getNextId() {
    try {
      const max = (await Database.rawQuery('select MAX(id) from admin_logs')).rows[0].max
      if (max) return max + 1
      else return 0
    } catch (e) {
      console.error(`-> ${e.message}`)
    }
  }

  // hooks
  @beforeSave()
  public static async generateId(log: AdminLog) {
    log.id = await this.getNextId()
  }
}
