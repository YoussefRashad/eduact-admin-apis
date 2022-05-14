import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { phoneNumberRegEx } from 'App/Constants/Regex'

export default class StudentUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]),
    password: schema.string.optional({ trim: true }, [rules.minLength(8), rules.maxLength(22)]),
    phone_number: schema.string.optional({ trim: true }, [rules.regex(phoneNumberRegEx)]),
    first_name: schema.string.optional({ trim: true }),
    middle_name: schema.string.optional({ trim: true }, [rules.minLength(2)]),
    last_name: schema.string.optional({ trim: true }),
    gender: schema.enum.optional(['male', 'female']),
    email: schema.string({ trim: true }, [rules.email()]),
    birth_date: schema.date.optional(),
    email_verified: schema.boolean.optional(),
    student: schema.object.optional().members({
      parent1_relation: schema.string.optional({ trim: true }, [rules.minLength(2)]),
      parent2_relation: schema.string.optional({ trim: true }, [rules.minLength(2)]),
      parent1_phone: schema.string.optional({ trim: true }, [rules.regex(phoneNumberRegEx)]),
      parent2_phone: schema.string.optional({ trim: true }, [rules.regex(phoneNumberRegEx)]),
      school: schema.string.optional({ trim: true }),
      profile_complete: schema.boolean.optional(),
      education_type_id: schema.number.optional(),
      education_language_id: schema.number.optional(),
      education_section_id: schema.number.optional(),
      education_year_id: schema.number.optional(),
      ssn: schema.string.optional(),
    }),
    address: schema.object.optional().members({
      building_number: schema.string.optional({ trim: true }),
      floor: schema.string.optional({ trim: true }),
      apartment: schema.string.optional({ trim: true }),
      street: schema.string.optional({ trim: true }),
      governorate: schema.number.optional([rules.exists({ table: 'governorates', column: 'id' })]),
      city: schema.number.optional([rules.exists({ table: 'cities', column: 'id' })]),
      country: schema.string.optional({ trim: true }),
      postal_code: schema.string.optional({ trim: true }),
    }),
  })

  public messages = {}
}
