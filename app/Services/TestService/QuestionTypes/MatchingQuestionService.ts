import TestQuestion from 'App/Models/TestQuestion'
import { ITestQuestionPayload } from 'App/Interfaces/ITestQuestionPayload'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import MatchingQuestionOption from 'App/Models/MatchingQuestionOption'

export default class MatchingQuestionService extends TestQuestionService {
  constructor() {
    super()
  }

  /**
   *
   * @param testQuestion
   * @returns
   */
  public async createTestQuestion(testQuestion: Partial<ITestQuestionPayload>) {
    const { matching, tags, ...data } = testQuestion

    const question = await TestQuestion.create(data)
    await this.createMatchingOptions(question, matching!)
    await question.load('matchingOptions')
    return question
  }

  /**
   *
   * @param id
   * @param question
   * @returns
   */
  public async updateTestQuestion(id: number, question: Partial<ITestQuestionPayload>) {
    const { matching, tags, test_question_id, ...data } = question

    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    await testQuestion.merge(data).save()
    await this.createMatchingOptions(testQuestion, matching!)
    return testQuestion
  }

  /**
   *
   * @param testQuestion
   * @param matchingOptions
   * @returns
   */
  async createMatchingOptions(testQuestion: TestQuestion, matchingOptions: Partial<MatchingQuestionOption>[]) {
    await MatchingQuestionOption.query().where('testQuestionId', testQuestion.id).delete()
    return testQuestion.related('matchingOptions').createMany(matchingOptions)
  }
}
