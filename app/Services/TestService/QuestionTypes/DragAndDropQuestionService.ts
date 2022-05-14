import TestQuestion from 'App/Models/TestQuestion'
import { ITestQuestionPayload } from 'App/Interfaces/ITestQuestionPayload'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import CustomException from 'App/Exceptions/CustomException'
import DragDropQuestionOption from 'App/Models/DragDropQuestionOption'

export default class DragAndDropQuestionService extends TestQuestionService {
  constructor() {
    super()
  }

  /**
   *
   * @param testQuestion
   * @returns
   */
  public async createTestQuestion(testQuestion: Partial<ITestQuestionPayload>) {
    const { otherOptions, tags, ...data } = testQuestion
    const oldContent: string = data.content ?? ''
    let parsedContent = this.replaceTheGapsWith$$Index(data.content ?? '')
    const question = await TestQuestion.create({ ...data, parsedContent })
    try {
      await this.addDragDropQuestion(question, oldContent, otherOptions!)
    } catch (error) {
      await question.delete()
      throw error
    }
    await question.load('dragAndDropOptions')

    return question
  }

  /**
   *
   * @param id
   * @param question
   * @returns
   */
  public async updateTestQuestion(id: number, question: Partial<ITestQuestionPayload>) {
    const { otherOptions, tags, test_question_id, ...data } = question
    const newContent = this.replaceTheGapsWith$$Index(data.content ?? '')
    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    testQuestion.merge({ ...data, parsedContent: newContent })
    await this.addDragDropQuestion(testQuestion, data.content!, otherOptions!)
    await testQuestion.save()
    return testQuestion
  }

  /**
   *
   * @param content
   * @param otherOptions
   * @returns
   */
  private async createDragAndDropOptions(content: string, otherOptions: Array<string>) {
    let choices = this.getOptions(content)
    let others = otherOptions.map((option) => {
      return {
        value: option,
        gap: null,
      }
    })
    return [...others, ...choices]
  }

  /**
   *
   * @param text
   * @returns
   */
  private getOptions(text: string) {
    const openings = text.split('[').length
    const closings = text.split(']').length
    if (openings !== closings) throw new CustomException('Incorrect format convention', 400)
    let strSplitted = text.split('[')
    strSplitted.shift()
    return strSplitted.map((str, index) => {
      let valid = str.indexOf(']')
      if (valid === -1) throw new CustomException('Incorrect format convention', 400)

      let option = {
        value: str.split(']')[0],
        gap: index,
      }
      return option
    })
  }

  /**
   *
   * @param text
   * @returns
   */
  private replaceTheGapsWith$$Index(text: string) {
    try {
      let strSplitted = text.split(']').map((str) => str.trim())
      return strSplitted
        .map((str, index) => {
          if (index === strSplitted.length - 1) return str.split('[')[0].trim()
          return str.split('[')[0].trim() + ` $$${index}`
        })
        .join(' ')
    } catch (error) {
      throw new CustomException('Invalid format convention', 422)
    }
  }

  /**
   *
   * @param testQuestion
   * @param content
   * @param otherOptions
   */
  public async addDragDropQuestion(testQuestion: TestQuestion, content: string, otherOptions: Array<string>) {
    let dragDropOptions
    try {
      dragDropOptions = await this.createDragAndDropOptions(content, otherOptions)
    } catch (error) {
      throw error
    }
    await DragDropQuestionOption.query().where('testQuestionId', testQuestion.id).delete()
    await testQuestion.related('dragAndDropOptions').createMany(dragDropOptions)
    await testQuestion.load('dragAndDropOptions')
  }
}
