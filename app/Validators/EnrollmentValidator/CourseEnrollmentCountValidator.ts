import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CourseEnrollmentCountValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    course_id: schema.number(),
  })

  public messages = {}
}
