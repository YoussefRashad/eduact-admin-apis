import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddSlotsValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    webinar_id: schema.number([rules.exists({ table: 'webinars', column: 'id' })]),
    slots: schema.array().members(
      schema.object().members({
        startTime: schema.date(),
        endTime: schema.date.optional(),
        capacity: schema.number.optional([rules.unsigned()]),
        duration: schema.number([rules.unsigned()]),
        description: schema.string({ trim: true }),
        slotUrl: schema.string({ trim: true }),
      })
    ),
  })

  public messages = {}
}
