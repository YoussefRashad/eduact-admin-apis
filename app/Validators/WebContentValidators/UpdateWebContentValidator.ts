import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateWebContentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    webContentId: schema.number([rules.exists({ table: 'web_contents', column: 'id' })]),
    unit: schema.object().members({
      course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number.optional([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional(),
    }),
    webContent: schema.object().members({
      content: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
