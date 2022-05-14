import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadPhotoValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    photo: schema.file({
      size: '2mb',
      extnames: ['jpg', 'gif', 'png'],
    }),
    folder: schema.enum.optional(['profilepictures/instructors', 'classrooms', 'icons/subjects', 'banners']),
  })

  public messages = {}
}
