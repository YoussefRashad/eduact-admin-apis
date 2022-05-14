import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomTabsUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
    name: schema.string.optional({ trim: true }),
    classroom_id: schema.number.optional([rules.exists({ table: 'classrooms', column: 'id' })]),
    order: schema.number.optional(),
  })

  public messages = {}
}
