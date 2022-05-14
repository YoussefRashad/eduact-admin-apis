import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomTabsUpdateManyValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    tabs: schema.array().members(
      schema.object().members({
        id: schema.number([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
        name: schema.string.optional({ trim: true }),
        classroom_id: schema.number.optional([rules.exists({ table: 'classrooms', column: 'id' })]),
        order: schema.number.optional(),
      })
    ),
  })

  public messages = {}
}
