import MultipleChoiceQuestionOptions from 'App/Models/MultipleChoiceQuestionOptions'
import TestQuestion from '../../../Models/TestQuestion'
import { ITestQuestionPayload } from 'App/Interfaces/ITestQuestionPayload'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import CustomException from 'App/Exceptions/CustomException'

export default class McqQuestionService extends TestQuestionService {
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
    const question = await TestQuestion.create(data)
    await this.validateMcqChoices(mcq)
    await this.createMcqQuestionOptions(mcq, question.id)
    await question.load('multipleChoiceQuestions')
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
    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    await testQuestion.merge(data).save()
    await this.updateMcqQuestionOptions(testQuestion, mcq)
    return testQuestion
  }

  /**
   * Create many mcq questions
   * @param mcqQuestions
   * @param test_question_id
   */
  public async createMcqQuestionOptions(mcqQuestions: Partial<MultipleChoiceQuestionOptions>[] | undefined, test_question_id: number) {
    if (!mcqQuestions) return
    await Promise.all(
      mcqQuestions.map(async (question) => {
        await MultipleChoiceQuestionOptions.create({ ...question, test_question_id })
      })
    )
  }

  /**
   * delete the previous questions and create new questions
   * @param testQuestion
   * @param mcqQuestions
   */
  public async updateMcqQuestionOptions(testQuestion: TestQuestion, mcqQuestions: MultipleChoiceQuestionOptions[] | undefined) {
    if (!mcqQuestions) return
    await this.validateMcqChoices(mcqQuestions)
    await testQuestion.load('multipleChoiceQuestions')
    await Promise.all(
      testQuestion.multipleChoiceQuestions.map(async (question) => {
        await question.delete()
      })
    )
    await this.createMcqQuestionOptions(mcqQuestions, testQuestion.id)
    await testQuestion.load('multipleChoiceQuestions')
  }

  /**
   *
   * @param choices
   */
  async validateMcqChoices(choices: Array<{ choice: string; is_correct: boolean }> | undefined) {
    const therIsCorrect = choices?.filter((q) => q.is_correct === true)
    if (therIsCorrect?.length === 0) throw new CustomException('at leats one true answer must be provided', 400)
  }
}
