import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotifiableUnitsUpdateValidator {
  constructor (protected ctx: HttpContextContract) {
  }

	/*
	 * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
	 *
	 * For example:
	 * 1. The username must be of data type string. But then also, it should
	 *    not contain special characters or numbers.
	 *    ```
	 *     schema.string({}, [ rules.alpha() ])
	 *    ```
	 *
	 * 2. The email must be of data type string, formatted as a valid
	 *    email. But also, not used by any other user.
	 *    ```
	 *     schema.string({}, [
	 *       rules.email(),
	 *       rules.unique({ table: 'users', column: 'email' }),
	 *     ])
	 *    ```
	 */
  public schema = schema.create({
    units: schema.array().members(
      schema.object().members({
        unit_id: schema.number([rules.exists({ table: 'units', column: 'lms_id' })]),
        active: schema.boolean.optional(),
        whatsapp: schema.boolean.optional(),
        sms: schema.boolean.optional(),
        email: schema.boolean.optional(),
        instructor_name: schema.string.optional(),
        unit_name: schema.string.optional(),
        max_score: schema.number()
      })
    )
  })

	/**
	 * Custom messages for validation failures. You can make use of dot notation `(.)`
	 * for targeting nested fields and array expressions `(*)` for targeting all
	 * children of an array. For example:
	 *
	 * {
	 *   'profile.username.required': 'Username is required',
	 *   'scores.*.number': 'Define scores as valid numbers'
	 * }
	 *
	 */
  public messages = {}
}
