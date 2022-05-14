import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateWebinarValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    webinar_id: schema.number([rules.exists({ table: 'webinars', column: 'id' })]),
    unit: schema.object.optional().members({
      course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number.optional([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional([rules.unsigned()]),
      active: schema.boolean.optional()
    }),
    webinar: schema.object.optional().members({
      name: schema.string.optional({ trim: true }),
      description: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
