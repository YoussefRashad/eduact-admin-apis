import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomTabsCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    classroom_tab_id: schema.number([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
    order: schema.number(),
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
  })

  public messages = {}
}
