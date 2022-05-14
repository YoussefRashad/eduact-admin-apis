import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * *all* endpoint body => page, perPage, query, filters, sort by, from, to
 */
export default class GeneralAllValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
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
    export: schema.boolean.optional(),
  })

  public messages = {}
}
