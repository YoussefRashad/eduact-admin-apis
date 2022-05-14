import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number(),
    label: schema.string.optional({ trim: true }),
    instructor_id: schema.number.optional([rules.exists({ table: 'instructors', column: 'user_id' })]),
    category_id: schema.number.optional([rules.exists({ table: 'categories', column: 'id' })]),
    current_course: schema.number.optional(),
    title: schema.string.optional({ trim: true }),
    type: schema.string.optional({ trim: true }),
    description: schema.string.optional({ trim: true }),
    language: schema.string.optional({ trim: true }),
    thumbnail: schema.string.optional({ trim: true }),
    status: schema.string.optional(),
    sub_type: schema.string.optional(),
    active: schema.boolean.optional(),
    accessible: schema.boolean.optional(),
    weight: schema.number.optional(),
    has_admission: schema.boolean.optional(),
    admission_status: schema.boolean.optional(),
    code: schema.string.optional(),
    rating: schema.number.optional(),
    rating_count: schema.number.optional(),
    enrolled_count: schema.number.optional(),
    prerequisites: schema.string.optional(),
    admission_form_id: schema.number.optional([rules.exists({ table: 'admission_forms', column: 'id' })]),
    payment_methods_allowed: schema.string.optional({ trim: true }),
    educationLanguages: schema.array.optional().members(schema.number([rules.exists({ table: 'education_languages', column: 'id' })])),
    educationSections: schema.array.optional().members(schema.number([rules.exists({ table: 'education_sections', column: 'id' })])),
    educationTypes: schema.array.optional().members(schema.number([rules.exists({ table: 'education_types', column: 'id' })])),
    educationYears: schema.array.optional().members(schema.number([rules.exists({ table: 'education_years', column: 'id' })])),
  })

  public messages = {}
}
