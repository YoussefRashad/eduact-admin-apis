import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateCourseValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
    section_id: schema.number.optional([rules.exists({ table: 'sections', column: 'id' })]),
    sectionId: schema.number.optional([rules.exists({ table: 'sections', column: 'id' })]),
    name: schema.string({ trim: true }),
    description: schema.string.optional({ trim: true }),
    price: schema.number(),
    old_price: schema.number.optional(),
    payment_methods_allowed: schema.string(),
    order: schema.number.optional(),
    code: schema.string({ trim: true }, [rules.unique({ table: 'courses', column: 'code' })]),
    thumbnail: schema.string.optional({ trim: true }),
    preview_url: schema.string.optional(),
    capacity: schema.number.optional(),
    active: schema.boolean.optional(),
    active_start_date: schema.date.optional(),
    active_end_date: schema.date.optional(),
    buyable: schema.boolean.optional(),
    buy_start_date: schema.date.optional(),
    buy_end_date: schema.date.optional(),
    scores_view: schema.boolean.optional(),
    expiry_date: schema.date.optional(),
    expired: schema.boolean.optional(),
    expiry_period: schema.number.optional(),
  })

  public messages = {}
}
