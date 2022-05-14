import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateTestQuestionValidator {
  constructor(protected ctx: HttpContextContract) {}

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
    test_question_id: schema.number([rules.exists({ table: 'test_questions', column: 'id' })]),
    weight: schema.number.optional([rules.unsigned()]),
    content: schema.string.optional({ trim: true }),
    feedback: schema.string.optional({ trim: true }),
    order: schema.number.optional(),
    // types of questions
    mcq: schema.array.optional().members(
      schema.object().members({
        choice: schema.string({ trim: true }),
        is_correct: schema.boolean(),
      })
    ),
    ordering: schema.array.optional().members(
      schema.object().members({
        option: schema.string.optional({ trim: true }),
        order: schema.number.optional(),
      })
    ),
    otherOptions: schema.array.optional().members(schema.string({ trim: true })),
    matching: schema.array.optional([rules.requiredWhen('type', '=', 'matching'), rules.minLength(2)]).members(
      schema.object().members({
        value: schema.string({ trim: true }),
        match: schema.string({ trim: true }),
      })
    ),
    tags: schema.array.optional().members(
      schema.number([rules.exists({table: 'tags', column: 'id'})])
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
