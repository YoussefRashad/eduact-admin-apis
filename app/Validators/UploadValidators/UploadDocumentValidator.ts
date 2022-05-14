import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadDocumentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    document: schema.file({
      size: '2mb',
      extnames: ['pdf', 'ppt', 'txt', 'doc', 'docs'],
    }),
  })

  public messages = {}
}
