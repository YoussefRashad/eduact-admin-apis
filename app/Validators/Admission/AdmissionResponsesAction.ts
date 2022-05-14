import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdmissionResponsesAction {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    actions: schema.array().members(
      schema.object().members({
        id: schema.number(),
        admit: schema.boolean(),
      })
    ),
  })

  public messages = {}
}
