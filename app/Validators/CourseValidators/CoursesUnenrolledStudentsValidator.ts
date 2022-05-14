import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CoursesUnenrolledStudentsValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
    page: schema.number.optional(),
    perPage: schema.number.optional(),
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
