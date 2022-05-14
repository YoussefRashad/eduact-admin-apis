import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Newsfeed extends BaseModel {
  public static table = 'news_feeds'

  @column({ isPrimary: true })
  public id: number

  @column()
  public content: string

  @column()
  public photo: string

  @column()
  public redirection_url: string

  @column()
  public is_active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
