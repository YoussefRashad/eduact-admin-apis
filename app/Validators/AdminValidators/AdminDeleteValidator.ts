import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminDeleteValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string({ trim: true }, [rules.exists({ table: 'admins', column: 'uuid' })]),
  })

  public messages = {}
}
