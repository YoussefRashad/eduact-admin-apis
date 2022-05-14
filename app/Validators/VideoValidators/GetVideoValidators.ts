import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GetVideoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    videoId: schema.number([rules.exists({ table: 'videos', column: 'id' })]),
  })

  public messages = {}
}
