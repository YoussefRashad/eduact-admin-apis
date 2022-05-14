import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InstructorFindValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string({ trim: true }),
  })

  public messages = {}
}
