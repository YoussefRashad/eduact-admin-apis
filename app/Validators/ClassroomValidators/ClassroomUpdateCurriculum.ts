import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ClassroomUpdateCurriculum {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    tabs: schema.array().members(schema.object().members({
      id: schema.number([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
      order: schema.number([rules.unsigned()]),
      sections: schema.array.optional().members(schema.object().members({
        id: schema.number([rules.exists({ table: 'sections', column: 'id' })]),
        order: schema.number([rules.unsigned()]),
        classroom_tab_id: schema.number([rules.exists({ table: 'classroom_tabs', column: 'id' })]),
        courses: schema.array.optional().members(schema.object().members({
          id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
          order: schema.number([rules.unsigned()]),
          section_id: schema.number([rules.exists({ table: 'sections', column: 'id' })]),
        }))
      }))
    })),
  })

  public messages = {}
}
