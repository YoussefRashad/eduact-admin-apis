import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InvoiceUpdateStatusValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'invoices', column: 'id' })]),
    status: schema.string({ trim: true }),
  })

  public messages = {}
}
