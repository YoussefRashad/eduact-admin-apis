import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string({ trim: true }),
    description: schema.string({ trim: true }),
    active: schema.boolean.optional(),
    permissions: schema.array().members(schema.number([rules.exists({ table: 'permissions', column: 'id' })])),
  })

  public messages = {}
}
