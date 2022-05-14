import OrderingQuestionOptions from 'App/Models/OrderingQuestionOptions'
import TestQuestion from 'App/Models/TestQuestion'
import { ITestQuestionPayload } from 'App/Interfaces/ITestQuestionPayload'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import CustomException from 'App/Exceptions/CustomException'

export default class OrderingQuestionService extends TestQuestionService {
  constructor() {
    super()
  }

  /**
   *
   * @param testQuestion
   * @returns
   */
  public async createTestQuestion(testQuestion: Partial<ITestQuestionPayload>) {
    const { mcq, ordering, tags, ...data } = testQuestion
    this.checkTheOrderOfOrderingQuestion(ordering!)
    const question = await TestQuestion.create(data)
    await this.createOrderingQuestionOptions(ordering, question.id)
    await question.load('orderingQuestions')
    return question
  }

  /**
   *
   * @param id
   * @param question
   * @returns
   */
  public async updateTestQuestion(id: number, question: Partial<ITestQuestionPayload>) {
    const { mcq, ordering, tags, test_question_id, ...data } = question
    this.checkTheOrderOfOrderingQuestion(ordering!)
    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    await testQuestion.merge(data).save()
    await this.updateOrderingQuestionOptions(testQuestion, ordering)
    return testQuestion
  }

  /**
   * Create many ordering questions
   * @param orderingQuestions
   * @param test_question_id
   */
  public async createOrderingQuestionOptions(orderingQuestions: Partial<OrderingQuestionOptions>[] | undefined, test_question_id: number) {
    if (orderingQuestions)
      await Promise.all(
        orderingQuestions.map(async (question) => {
          await OrderingQuestionOptions.create({ ...question, test_question_id })
        })
      )
  }

  /**
   * delete the previous questions and create new questions
   * @param testQuestion
   * @param orderingQuestions
   */
  public async updateOrderingQuestionOptions(testQuestion: TestQuestion, orderingQuestions: Partial<OrderingQuestionOptions>[] | undefined) {
    await testQuestion.load('orderingQuestions')
    await Promise.all(
      testQuestion.orderingQuestions.map(async (question) => {
        await question.delete()
      })
    )
    if (orderingQuestions) await this.createOrderingQuestionOptions(orderingQuestions, testQuestion.id)
    await testQuestion.load('orderingQuestions')
  }

  public checkTheOrderOfOrderingQuestion(orderingQuestions: Partial<OrderingQuestionOptions>[]) {
    orderingQuestions.map((question, index) => {
      if (question.order !== index + 1) {
        throw new CustomException('The choices must be provided in sequential order')
      }
    })
  }
}
