import Test from 'App/Models/Test'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import TestModel from 'App/Models/TestModel'
import TestQuestion from 'App/Models/TestQuestion'
import CustomException from 'App/Exceptions/CustomException'

export default class TestModelService {
  /**
   *
   * @param id
   */
  public async isTestActive(id: number): Promise<boolean> {
    const test = await Test.find(id)
    if (!test) {
      throw new ResourceNotFoundException('Invalid test id')
    }
    return test.active
  }

  /**
   *
   * @param modelId
   */
  public async getTestModelQuestionsWeights(modelId: number): Promise<number> {
    const testModel = await TestModel.query()
      .where('id', modelId)
      .withAggregate('modelQuestions', (query) => {
        query.sum('weight').as('sum')
      })
      .first()
    return testModel?.$extras.sum
  }

  /**
   *
   * @param modelQuestionsPivot
   * @param testModel
   */
  public async validateModelQuestionsTests(
    modelQuestionsPivot: Array<{ test_question_id: number; order: number | undefined }>,
    testModel: TestModel
  ): Promise<void>{
    const failed = await TestQuestion.query().whereIn('id', modelQuestionsPivot.map((question) => question.test_question_id)).andWhereNot('test_id', testModel.test_id)
    if(failed.length){
      throw new CustomException(`questions: "${failed.map((q) => q.content)}" does not belong to this test`, 422)
    }
  }

  /**
   *
   * @param modelQuestionsPivot
   * @param testModel
   */
  public async setModelQuestions(
    modelQuestionsPivot: Array<{ test_question_id: number; order: number | undefined }>,
    testModel: TestModel
  ): Promise<void> {
    await this.validateModelQuestionsTests(modelQuestionsPivot, testModel)
    let syncModelQuestions = {}
    for (const modelQuestion of modelQuestionsPivot) {
      syncModelQuestions[modelQuestion.test_question_id] = {
        order: modelQuestion.order,
      }
    }
    await testModel.related('modelQuestions').sync(syncModelQuestions)
  }

  /**
   *
   * @param testId
   */
  public async setTestMode(testId: number): Promise<void> {
    const testModel = await TestModel.query().where('test_id', testId).first()
    if (testModel) {
      await Test.query().where('id', testId).update({ model_mode: 'multiple' })
      return
    }
    // recalculate original test questions weight and set test with this value
    const testQuestionsWeight = await this.getTestQuestionsWeights(testId)
    await Test.query().where('id', testId).update({
      model_mode: 'single',
      overall_score: testQuestionsWeight,
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
}
