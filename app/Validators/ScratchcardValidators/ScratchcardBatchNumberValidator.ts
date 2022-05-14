import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ScratchcardBatchNumberValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    batch_number: schema.number([rules.exists({ table: 'scratchcards', column: 'batch' })]),
  })

  public messages = {}
}
