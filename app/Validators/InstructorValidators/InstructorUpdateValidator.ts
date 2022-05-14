import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { phoneNumberRegEx } from 'App/Constants/Regex'

export default class InstructorUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  // same as the create schema but all the properties are optional
  public schema = schema.create({
    uuid: schema.string({ trim: true }),
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({ trim: true }, [rules.minLength(8), rules.maxLength(20)]),
    phone_number: schema.string.optional({ trim: true }),
    first_name: schema.string.optional({ trim: true }),
    middle_name: schema.string.optional({ trim: true }),
    last_name: schema.string.optional({ trim: true }),
    gender: schema.enum.optional(['male', 'female']),
    birth_date: schema.date.optional(),
    lms_id: schema.number.optional(),
    profile_photo: schema.string.optional({ trim: true }),
    instructor: schema.object.optional().members({
      label: schema.string.optional({ trim: true }),
      branch_id: schema.number.optional(),
      branch_name: schema.string.optional({ trim: true }),
      grad_year: schema.number.optional(),
      fb_link: schema.string.optional({ trim: true }, [rules.url()]),
      twitter_link: schema.string.optional({ trim: true }, [rules.url()]),
      youtube_link: schema.string.optional({ trim: true }, [rules.url()]),
      linkedin_link: schema.string.optional({ trim: true }, [rules.url()]),
      website_link: schema.string.optional({ trim: true }, [rules.url()]),
      bio: schema.string.optional({ trim: true }),
      weight: schema.string.optional(),
      educationLanguages: schema.array.optional().members(schema.number([rules.exists({ table: 'education_languages', column: 'id' })])),
      educationSections: schema.array.optional().members(schema.number([rules.exists({ table: 'education_sections', column: 'id' })])),
      educationTypes: schema.array.optional().members(schema.number([rules.exists({ table: 'education_types', column: 'id' })])),
      educationYears: schema.array.optional().members(schema.number([rules.exists({ table: 'education_years', column: 'id' })])),
    }),
  })

  public messages = {}
}
