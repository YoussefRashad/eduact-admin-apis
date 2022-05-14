import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAdmissionFormValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number(),
    admissionForm: schema.object.optional().members({
      name: schema.string.optional({ trim: true }),
      description: schema.string.optional({ trim: true }),
      active: schema.boolean.optional(),
    }),
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
