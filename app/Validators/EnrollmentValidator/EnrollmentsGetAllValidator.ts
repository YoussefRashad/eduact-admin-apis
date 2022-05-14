import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EnrollmentsGetAllValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
    page: schema.number(),
    perPage: schema.number(),
    query: schema.string.optional({ trim: true }),
    filters: schema.array.optional().anyMembers(),
    sortBy: schema.object.optional().members({
      field: schema.string({ trim: true }),
      direction: schema.enum(['asc', 'desc', undefined]),
    }),
    from: schema.date.optional(),
    to: schema.date.optional(),
  })

  public messages = {}
}
