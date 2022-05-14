import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminLoginValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    password: schema.string({ trim: true }, [rules.minLength(8), rules.maxLength(22)]),
  })

  public messages = {}
}
