import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NewsfeedCreateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    content: schema.string({ trim: true }),
    photo: schema.string({ trim: true }, [rules.url()]),
    redirection_url: schema.string({ trim: true }, [rules.url()]),
    is_active: schema.boolean.optional(),
  })

  public messages = {}
}
