import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateTestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([rules.exists({ table: 'tests', column: 'id' })]),
    unit: schema.object.optional().members({
      course_id: schema.number.optional([rules.exists({ table: 'courses', column: 'id' })]),
      type_id: schema.number.optional([rules.exists({ table: 'unit_types', column: 'id' })]),
      name: schema.string.optional({ trim: true }),
      order: schema.number.optional(),
      active: schema.boolean.optional(),
    }),
    test: schema.object.optional().members({
      duration: schema.number.optional([rules.unsigned()]),
      overallScore: schema.number.optional([rules.unsigned()]),
      passingValue: schema.number.optional([rules.unsigned()]),
      allowedTrials: schema.number.optional([rules.unsigned()]),
      title: schema.string.optional({ trim: true }),
      startText: schema.string.optional({ trim: true }),
      endText: schema.string.optional({ trim: true }),
      messageIfPassed: schema.string.optional({ trim: true }),
      messageIfFailed: schema.string.optional({ trim: true }),
      passingUnit: schema.enum.optional(['percentage', 'point']),
      allowRepetitionWhen: schema.enum.optional(['always', 'failed']),
      viewMode: schema.enum.optional(['single', 'multiple']),
      shuffleQuestion: schema.boolean.optional(),
      shuffleAnswers: schema.boolean.optional(),
      showCorrectIfPassed: schema.boolean.optional(),
      showCorrectIfFailed: schema.boolean.optional(),
      showScorePercentage: schema.boolean.optional(),
      showScoreValue: schema.boolean.optional(),
      showGrade: schema.boolean.optional(),
      allowMovement: schema.boolean.optional(),
      activeStartDate: schema.date.optional(),
      activeEndDate: schema.date.optional(),
    }),
    gradeSchema: schema.array.optional().members(
      schema.object().members({
        grade: schema.string({ trim: true }),
        from: schema.number(),
        to: schema.number(),
      })
    ),
  })

  public messages = {}
}
