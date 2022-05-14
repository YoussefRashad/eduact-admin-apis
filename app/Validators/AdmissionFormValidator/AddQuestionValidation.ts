import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddQuestionValidation {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    admission_form_id: schema.number(),
    question: schema.string({ trim: true }),
    type: schema.string({ trim: true }),
    options: schema.array.optional().members(schema.string({ trim: true })),
    order: schema.number(),
  })

  public messages = {}
}
