import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { uuidSchema } from 'App/Constants/ValidatorSchemas'

export default class StudentFindValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: uuidSchema,
  })

  public messages = {}
}
