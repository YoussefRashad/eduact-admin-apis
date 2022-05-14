import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PrerequisiteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
  })

  public messages = {}
}
