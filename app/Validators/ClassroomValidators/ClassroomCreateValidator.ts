import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomCreateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    instructor_id: schema.number([rules.exists({ table: 'instructors', column: 'user_id' })]),
    category_id: schema.number([rules.exists({ table: 'categories', column: 'id' })]),
    current_course: schema.number.optional(),
    title: schema.string({ trim: true }),
    label: schema.string({ trim: true }, [rules.unique({ table: 'classrooms', column: 'label' })]),
    type: schema.string({ trim: true }),
    description: schema.string({ trim: true }),
    language: schema.string.optional({ trim: true }),
    sub_type: schema.string.optional(),
    thumbnail: schema.string.optional({ trim: true }),
    status: schema.string({ trim: true }),
    active: schema.boolean.optional(),
    accessible: schema.boolean.optional(),
    weight: schema.number.optional(),
    has_admission: schema.boolean.optional(),
    admission_status: schema.boolean.optional(),
    code: schema.string({trim: true}, [
      rules.unique({ table: 'classrooms', column: 'code' })
    ]),
    rating: schema.number.optional(),
    rating_count: schema.number.optional(),
    enrolled_count: schema.number.optional(),
    prerequisites: schema.string.optional(),
    admission_form_id: schema.number.optional([rules.exists({ table: 'admission_forms', column: 'id' })]),
    payment_methods_allowed: schema.string.optional(),
    educationLanguages: schema.array().members(schema.number([rules.exists({ table: 'education_languages', column: 'id' })])),
    educationSections: schema.array.optional().members(schema.number([rules.exists({ table: 'education_sections', column: 'id' })])),
    educationTypes: schema.array().members(schema.number([rules.exists({ table: 'education_types', column: 'id' })])),
    educationYears: schema.array().members(schema.number([rules.exists({ table: 'education_years', column: 'id' })])),
  })

  public messages = {}
}
