import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminFindValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string(),
  })

  public messages = {}
}
