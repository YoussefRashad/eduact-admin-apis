import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateQuestionValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    admission_form_id: schema.number([rules.exists({ table: 'admission_forms', column: 'id' })]),
    questions: schema.array().members(
      schema.object().members({
        id: schema.number.optional([rules.exists({ table: 'questions', column: 'id' })]),
        question: schema.string.optional({ trim: true }),
        type: schema.string.optional({ trim: true }),
        options: schema.array.optional().members(schema.string({ trim: true })),
        order: schema.number.optional(),
      })
    ),
  })

  public messages = {}
}
