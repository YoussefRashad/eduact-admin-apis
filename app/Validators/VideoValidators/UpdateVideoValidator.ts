import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateVideoValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    videoId: schema.number([rules.exists({ table: 'videos', column: 'id' })]),

    unit: schema.object.optional().members({
      course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number.optional([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional(),
    }),
    video: schema.object.optional().members({
      name: schema.string.optional({ trim: true }),
      uri: schema.string.optional({ trim: true }),
      provider: schema.string.optional({ trim: true }),
      providerVideoId: schema.string.optional({ trim: true }, []),
      duration: schema.number.optional([rules.unsigned()]),
    }),
  })

  public messages = {}
}
