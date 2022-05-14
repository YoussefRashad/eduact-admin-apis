import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsfeedGetValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'news_feeds', column: 'id' })]),
  })

  public messages = {}
}
