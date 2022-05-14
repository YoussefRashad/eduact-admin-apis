import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomGetValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    label: schema.string({ trim: true }),
  })

  public messages = {}
}
