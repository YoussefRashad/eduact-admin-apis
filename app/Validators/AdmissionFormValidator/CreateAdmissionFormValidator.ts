import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateAdmissionFormValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
    admissionForm: schema.object().members({
      name: schema.string({ trim: true }),
      description: schema.string({ trim: true }),
      active: schema.boolean.optional(),
    }),
    questions: schema.array().members(
      schema.object().members({
        question: schema.string({ trim: true }),
        type: schema.string({ trim: true }),
        options: schema.array.optional().members(schema.string({ trim: true })),
        order: schema.number(),
      })
    ),
  })

  public messages = {}
}
