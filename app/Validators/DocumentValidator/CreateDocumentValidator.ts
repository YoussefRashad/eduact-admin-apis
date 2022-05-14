import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateDocumentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    unit: schema.object().members({
      course_id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string({ trim: true }),
      order: schema.number.optional(),
    }),
    document: schema.object().members({
      file_name: schema.string.optional({ trim: true }),
      uri: schema.string({ trim: true }),
      size: schema.number.optional(),
      extension: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
