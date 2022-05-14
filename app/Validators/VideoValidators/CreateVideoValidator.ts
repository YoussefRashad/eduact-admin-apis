import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateVideoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    unit: schema.object().members({
      course_id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string({ trim: true }),
      order: schema.number.optional(),
    }),
    video: schema.object().members({
      name: schema.string({ trim: true }),
      uri: schema.string({ trim: true }),
      provider: schema.string({ trim: true }),
      providerVideoId: schema.string.optional({ trim: true }),
      duration: schema.number([rules.unsigned()]),
    }),
  })

  public messages = {}
}
