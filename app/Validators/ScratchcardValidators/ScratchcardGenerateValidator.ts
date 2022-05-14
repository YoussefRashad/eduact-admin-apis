import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ScratchcardGenerateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    classroom_id: schema.number([rules.exists({ table: 'classrooms', column: 'id' })]),
    course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
    quantity: schema.number(),
    scheme: schema.string.optional(),
  })

  public messages = {}
}
