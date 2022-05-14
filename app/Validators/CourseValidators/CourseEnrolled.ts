import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules } from '@ioc:Adonis/Core/Validator'

export default class CourseEnrolledValidation {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    courseId: schema.number(),
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
