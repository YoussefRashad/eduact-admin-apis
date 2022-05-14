import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatWebContentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    unit: schema.object().members({
      course_id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string({ trim: true }),
      order: schema.number.optional(),
    }),
    webContent: schema.object().members({
      content: schema.string({ trim: true }),
    }),
  })

  public messages = {}
}
