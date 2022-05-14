import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomTabsCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
    order: schema.number(),
  })

  public messages = {}
}
