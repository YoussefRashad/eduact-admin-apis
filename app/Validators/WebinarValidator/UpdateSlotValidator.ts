import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateSlotsValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number(),
    startTime: schema.date.optional(),
    endTime: schema.date.optional(),
    capacity: schema.number.optional([rules.unsigned()]),
    duration: schema.number.optional([rules.unsigned()]),
    description: schema.string.optional({ trim: true }),
    slotUrl: schema.string.optional({ trim: true }),
  })

  public messages = {}
}
