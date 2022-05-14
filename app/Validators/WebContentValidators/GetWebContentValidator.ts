import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GetWebContentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    webContentId: schema.number([rules.exists({ table: 'web_contents', column: 'id' })]),
  })
  public messages = {}
}
