import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SectionUpdateManyValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    sections: schema.array().members(
      schema.object().members({
        id: schema.number([rules.exists({ table: 'sections', column: 'id' })]),
        name: schema.string.optional({ trim: true }),
        classroom_tab_id: schema.number.optional([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
        order: schema.number.optional(),
        classroom_id: schema.number.optional([rules.exists({ table: 'classrooms', column: 'id' })]),
      })
    ),
  })

  public messages = {}
}
