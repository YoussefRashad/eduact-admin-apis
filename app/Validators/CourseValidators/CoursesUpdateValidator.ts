import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CoursesUpdateValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
    classroom_id: schema.number.optional([rules.exists({ table: 'classrooms', column: 'id' })]),
    section_id: schema.number.optional([rules.exists({ table: 'sections', column: 'id' })]),
    name: schema.string.optional({ trim: true }),
    description: schema.string.optional({ trim: true }),
    price: schema.number.optional(),
    number: schema.number.optional(),
    code: schema.string.optional({ trim: true }),
    active: schema.boolean.optional(),
    order: schema.number.optional(),
    thumbnail: schema.string.optional({ trim: true }),
    scores_view: schema.boolean.optional(),
    buyable: schema.boolean.optional(),
    old_price: schema.number.optional(),
    preview_url: schema.string.optional(),
    capacity: schema.number.optional(),
    payment_methods_allowed: schema.string.optional(),
    expired: schema.boolean.optional(),
    expiry_date: schema.date.optional(),
    expiry_period: schema.number.optional(),
    active_start_date: schema.date.optional(),
    active_end_date: schema.date.optional(),
    buy_start_date: schema.date.optional(),
    buy_end_date: schema.date.optional(),
  })

  public messages = {}
}
