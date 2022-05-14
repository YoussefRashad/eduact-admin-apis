import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { phoneNumberRegEx } from 'App/Constants/Regex'

export default class AdminUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string({ trim: true }, [rules.exists({ table: 'admins', column: 'uuid' })]),
    first_name: schema.string.optional({ trim: true }),
    last_name: schema.string.optional({ trim: true }),
    email: schema.string.optional({ trim: true }, [rules.unique({ table: 'admins', column: 'email' })]),
    phone_number: schema.string.optional({ trim: true }, [rules.regex(phoneNumberRegEx), rules.unique({ table: 'admins', column: 'email' })]),
    password: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    gender: schema.enum.optional(['male', 'female']),
    middle_name: schema.string.optional({ trim: true }),
    type: schema.enum.optional(['super', 'admin']),
    active: schema.boolean.optional(),
    profile_photo: schema.string.optional({ trim: true }),
    roles: schema.array.optional().members(schema.number([rules.exists({ table: 'roles', column: 'id' })])),
  })

  public messages = {}
}
