import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CourseGetAllValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    classroom: schema.string({ trim: true }, [rules.exists({ table: 'classrooms', column: 'label' })]),
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
