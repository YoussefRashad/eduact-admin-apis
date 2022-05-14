import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AssignRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    admin_id: schema.number([rules.exists({ table: 'admins', column: 'id' })]),
    roles: schema.array().members(schema.number([rules.exists({ table: 'roles', column: 'id' })])),
  })
  public messages = {}
}
