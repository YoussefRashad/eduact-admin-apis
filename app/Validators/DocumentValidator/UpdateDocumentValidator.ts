import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateDocumentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    document_id: schema.number([rules.exists({ table: 'documents', column: 'id' })]),
    unit_data: schema.object.optional().members({
      course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number.optional([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional(),
    }),
    document_data: schema.object.optional().members({
      file_name: schema.string.optional({ trim: true }),
      uri: schema.string.optional({ trim: true }),
      size: schema.number.optional(),
      extension: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
