import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StudentUnenrollFromCourseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'courses', column: 'id' })]),
    email: schema.string({ trim: true }, [rules.email()]),
    refund: schema.boolean(),
  })

  public messages = {}
}
