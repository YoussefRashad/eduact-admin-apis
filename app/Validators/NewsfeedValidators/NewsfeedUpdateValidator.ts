import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsfeedUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'news_feeds', column: 'id' })]),
    content: schema.string.optional({ trim: true }),
    photo: schema.string.optional({ trim: true }, [rules.url()]),
    redirection_url: schema.string.optional({ trim: true }, [rules.url()]),
    is_active: schema.boolean.optional(),
  })

  public messages = {}
}
