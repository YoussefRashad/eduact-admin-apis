import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InstructorCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    password: schema.string({ trim: true }, [rules.minLength(8), rules.maxLength(20)]),
    phone_number: schema.string({ trim: true }, [rules.unique({ table: 'users', column: 'phone_number' })]),
    first_name: schema.string({ trim: true }),
    middle_name: schema.string.optional({ trim: true }),
    last_name: schema.string({ trim: true }),
    gender: schema.enum(['male', 'female']),
    birth_date: schema.date.optional(),
    profile_photo: schema.string.optional({ trim: true }),
    instructor: schema.object().members({
      label: schema.string({ trim: true }, [rules.unique({ table: 'instructors', column: 'label' })]),
      grad_year: schema.number.optional(),
      bio: schema.string.optional({ trim: true }),
      fb_link: schema.string.optional({ trim: true }, [rules.url()]),
      twitter_link: schema.string.optional({ trim: true }, [rules.url()]),
      youtube_link: schema.string.optional({ trim: true }, [rules.url()]),
      linkedin_link: schema.string.optional({ trim: true }, [rules.url()]),
      website_link: schema.string.optional({ trim: true }, [rules.url()]),
      weight: schema.string.optional(),
      educationLanguages: schema.array.optional().members(schema.number([rules.exists({ table: 'education_languages', column: 'id' })])),
      educationSections: schema.array.optional().members(schema.number([rules.exists({ table: 'education_sections', column: 'id' })])),
      educationTypes: schema.array.optional().members(schema.number([rules.exists({ table: 'education_types', column: 'id' })])),
      educationYears: schema.array.optional().members(schema.number([rules.exists({ table: 'education_years', column: 'id' })])),
    }),
  })

  public messages = {}
}
