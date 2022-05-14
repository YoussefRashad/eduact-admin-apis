import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RemoveQuestionValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    admission_form_id: schema.number(),
    question_id: schema.number(),
  })

  public messages = {}
}
