import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'roles', column: 'id' })]),
    title: schema.string.optional({ trim: true }),
    description: schema.string.optional({ trim: true }),
    active: schema.boolean.optional(),
    permissions: schema.array.optional().members(schema.number([rules.exists({ table: 'permissions', column: 'id' })])),
  })
  public messages = {}
}
