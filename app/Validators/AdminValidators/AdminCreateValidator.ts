import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { phoneNumberRegEx } from 'App/Constants/Regex'

export default class AdminCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string({ trim: true }),
    last_name: schema.string({ trim: true }),
    middle_name: schema.string.optional({ trim: true }),
    email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'admins', column: 'email' })]),
    phone_number: schema.string({ trim: true }, [rules.regex(phoneNumberRegEx), rules.unique({ table: 'admins', column: 'phone_number' })]),
    password: schema.string({ trim: true }),
    type: schema.enum(['super', 'admin']),
    active: schema.boolean.optional(),
    gender: schema.enum(['male', 'female']),
    profile_photo: schema.string({ trim: true }),
    roles: schema.array().members(schema.number([rules.exists({ table: 'roles', column: 'id' })])),
  })

  public messages = {}
}
