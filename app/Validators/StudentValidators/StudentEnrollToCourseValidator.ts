import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StudentEnrollToCourseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
    deduct: schema.boolean(),
  })

  public messages = {}
}
