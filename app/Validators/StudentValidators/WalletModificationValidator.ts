import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WalletModificationValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]), // fails fast if uuid doesn't exist on users table
    amount: schema.number([rules.range(1, Number.MAX_VALUE)]),
    description: schema.string.optional({}, [rules.minLength(2)]),
  })

  public messages = {}
}
