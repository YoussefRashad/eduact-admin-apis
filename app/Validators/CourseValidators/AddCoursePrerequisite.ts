import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddCoursePrerequisite {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    course_id: schema.number(),
    prerequisites: schema.array().members(
      schema.object().members({
        prerequisite: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
        path: schema.number(),
      })
    ),
  })

  public messages = {}
}
