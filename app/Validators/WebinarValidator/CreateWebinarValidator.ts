import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateWebinarValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    unit: schema.object().members({
      course_id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional([rules.unsigned()]),
      active: schema.boolean.optional()
    }),
    webinar: schema.object().members({
      name: schema.string.optional({ trim: true }),
      description: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
