import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CategoryUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number(),
    parent_id: schema.number.optional(),
    name: schema.string({ trim: true }, [rules.minLength(2)]),
    code: schema.string.optional({ trim: true }),
    icon: schema.string.optional({ trim: true }),
  })

  public messages = {}
}
