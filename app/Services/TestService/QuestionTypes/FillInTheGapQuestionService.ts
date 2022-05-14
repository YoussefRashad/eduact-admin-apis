import FillinTheGapQuestionOptions from 'App/Models/FillinTheGapQuestionOptions'
import TestQuestion from 'App/Models/TestQuestion'
import { ITestQuestionPayload } from 'App/Interfaces/ITestQuestionPayload'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import CustomException from 'App/Exceptions/CustomException'

export default class FillInTheGapQuestionService extends TestQuestionService {
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
    const oldContent: string = data.content ?? ''
    let parsedContent = this.replaceTheGapsWith$$Index(data.content ?? '')
    const question = await TestQuestion.create({ ...data, parsedContent })
    try {
      await this.createFillInTheGapQuestionOptions(oldContent, question.id)
    } catch (error) {
      await question.delete()
      throw error
    }
    await question.load('fillInTheGapQuestions')
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
    const newContent = this.replaceTheGapsWith$$Index(data.content ?? '')
    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    await testQuestion.merge({ ...data, parsedContent: newContent })
    try {
      await this.createFillInTheGapQuestionOptions(data.content!, testQuestion.id)
    } catch (error) {
      throw error
    }
    testQuestion.save()
    await testQuestion.load('fillInTheGapQuestions')
    return testQuestion
  }

  /**
   * Create many gap questions
   * @param content
   * @param test_question_id
   */
  public async createFillInTheGapQuestionOptions(content: string, test_question_id: number) {
    const choices = this.getChoices(content)
    await FillinTheGapQuestionOptions.query().where('test_question_id', test_question_id).delete()
    await Promise.all(
      choices.map(async (question, index) => {
        await FillinTheGapQuestionOptions.create({
          test_question_id,
          gap: index + 1,
          ...question,
        })
      })
    )
  }

  /**
   * Get Choices from the string
   * String is expected (bla bla bla is [x, (y), z] and bla bla is [(a), b] and ..)
   * returned [ { choices:[x, y, z], correct: y }, { choices:[a, b], correct: a } ]
   * @param text
   * @returns
   */
  public getChoices(text: string) {
    try {
      let strSplitted = text.split(']')
      strSplitted.pop() // to pop the the last of strSplitted, it has no choices
      return strSplitted.map((str) => {
        const result = str
          .split('[')[1]
          .split(',')
          .map((str) => {
            let is_correct = str.trim()[0] === '(' ? true : false
            return {
              choice: is_correct ? str.trim().slice(1, -1) : str.trim(),
              is_correct,
            }
          })
        return {
          choices: `[${result.map((str) => str.choice).join(', ')}]`,
          correct: result.find((str) => str.is_correct)?.choice,
        }
      })
    } catch (error) {
      throw new CustomException('Incorrect format convention', 400)
    }
  }

  /**
   * Replace the Choices from the string with $$index
   * String is expected (bla bla bla is [x, (y), z] and bla bla is [(a), b] and ..)
   * returned (bla bla bla is $$0 and bla bla is $$1 and ..)
   * @param text
   * @returns
   */
  public replaceTheGapsWith$$Index(text: string) {
    let openings = text.split('[').length
    let closings = text.split(']').length
    if (openings !== closings) throw new CustomException('Incorrect format convention', 400)
    try {
      let strSplitted = text.split(']').map((str) => str.trim())
      return strSplitted
        .map((str, index) => {
          if (index === strSplitted.length - 1) return str.split('[')[0].trim()
          return str.split('[')[0].trim() + ` $$${index}`
        })
        .join(' ')
    } catch (error) {
      throw new CustomException('The format convention')
    }
  }
}
