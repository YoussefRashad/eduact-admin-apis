import CustomException from 'App/Exceptions/CustomException'
import GradeScheme from 'App/Models/GradeScheme'
import Test from 'App/Models/Test'
import Unit from 'App/Models/Unit'

export default class TestService {
  /**
   *
   * @param testData
   * @returns
   */
  async createTest(testData: Partial<Test>, unit: Partial<Unit>) {
    let data = { ...testData }
    if (!data.title) data.title = unit.name
    return Test.create(data)
  }
  /**
   *
   * @param id
   * @returns
   */
  async findTestOrFail(id: number) {
    return Test.query().where('id', id).firstOrFail()
  }
  /**
   *
   * @param test
   * @param data
   * @returns
   */
  async updateTest(test: Test, data: Partial<Test>) {
    return test.merge(data).save()
  }
  /**
   *
   * @param gradeSchema
   * @returns
   */
  async validateGradeSchema(gradeSchema: Array<{ from: number; to: number; grade: string }> | undefined) {
    if (!gradeSchema || gradeSchema.length === 0) return
    let grades = new Set(gradeSchema.map((record) => record.grade))
    if (gradeSchema.length !== grades.size) throw new CustomException('invalid grade schema, Duplicates Found', 422)
    gradeSchema.sort((a, b) => a?.from - b?.from)
    const firstRecord = gradeSchema[0]
    let end = firstRecord.to

    if (firstRecord.from !== 0 || gradeSchema[gradeSchema.length - 1].to !== 100)
      throw new CustomException('Invalid grade schema, schema ranges must start from 0 and end with 100', 422)
    if (firstRecord.from > firstRecord.to) throw new CustomException('Invalid Grade Schema, from value must be less than to', 422)

    for (let i = 1; i < gradeSchema.length; i++) {
      if (gradeSchema[i].from > gradeSchema[i].to) throw new CustomException('Invalid Grade Schema, from value must be less than to', 422)
      if (gradeSchema[i - 1].to >= gradeSchema[i].from) throw new CustomException('Overlap occurs between grades ranges', 422)
      if (gradeSchema[i - 1].to !== gradeSchema[i].from - 1) throw new CustomException('Gap occurs between grades ranges', 422)
      end = gradeSchema[i].to
    }
  }
  /**
   *
   * @param test
   * @param gradeSchema
   * @returns
   */
  async addGradeSchema(test: Test, gradeSchema: Partial<GradeScheme>[] | undefined) {
    if (!gradeSchema) return
    await this.deleteGradeSchema(test)
    return test.related('gradeSchema').createMany(gradeSchema)
  }
  /**
   *
   * @param test
   * @returns
   */
  async deleteGradeSchema(test: Test) {
    return GradeScheme.query().where('test_id', test?.id).delete()
  }
  /**
   *
   * @param test
   * @returns
   */
  async validateTest(test: Test) {
    if (test.active) {
      throw new CustomException('Test already active', 422)
    }
    if (!test.overallScore || !test.passingValue || !test.passingUnit) {
      throw new CustomException('overall score, passing value and passing unit all must be provided', 422)
    }
    if (test.passingUnit === 'percentage' && test.passingValue > 100) {
      throw new CustomException("passing value can't be more than 100%", 422)
    }
    if (test.passingUnit === 'point' && test.passingValue > test.overallScore) {
      throw new CustomException("passing value can't be more than the overall score", 422)
    }
    if (!test.active && test.modelMode === 'multiple') {
      await this.verifyTestModels(test)
    }
    return
  }
  /**
   *
   * @param test
   * @returns
   */
  async verifyTestModels(test: Test) {
    await test.load('testModels', (qury) => {
      qury.preload('modelQuestions')
    })
    test.testModels.forEach((model) => {
      let sum = 0
      model.modelQuestions.forEach((question) => (sum += question.weight))

      if (sum !== test.overallScore) throw new CustomException("models score doesn't match the test overall score", 422)
    })

    return
  }

  /**
   *
   * @param testId
   */
  public async getTestQuestionsWeights(testId: number): Promise<number> {
    const test = await Test.query()
      .where('id', testId)
      .withAggregate('questions', (query) => {
        query.sum('weight').as('sum')
      })
      .first()
    return test?.$extras.sum
  }

  /**
   *
   * @param testId
   */
  async setOverallScore(testId: number): Promise<void> {
    const questionsWeight = await this.getTestQuestionsWeights(testId)
    await Test.query().where('id', testId).update({ overallScore: questionsWeight })
  }
}
