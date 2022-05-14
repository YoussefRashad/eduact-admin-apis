import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CategoryCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    parent_id: schema.number.optional(),
    name: schema.string({ trim: true }, [rules.minLength(2)]),
    code: schema.string({ trim: true }),
    icon: schema.string({ trim: true }),
  })

  public messages = {}
}
