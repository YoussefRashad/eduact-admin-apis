import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from 'App/Utils/Http'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import TestQuestionService from '../../../Services/TestService/TestQuestionService'
import RequireIdValidator from 'App/Validators/RequireIDValidator'
import CreateTestQuestionValidator from 'App/Validators/TestValidator/TestQuestionsValidator/CreateTestQuestionValidator'
import UpdateTestQuestionValidator from 'App/Validators/TestValidator/TestQuestionsValidator/UpdateTestQuestionValidator'
import TestQuestion from 'App/Models/TestQuestion'
import QuestionTypeMapper from "App/Mappers/QuestionTypeMapper"
import TestService from "App/Services/TestService/TestService";

export default class TestQuestionsController {

  testQuestionService = new TestQuestionService()
  questionTypeMapper = new QuestionTypeMapper()
  testService = new TestService()

  /**
   * Fetch test questions with its types and tags
   * @param param0
   * @returns
   */
  public async fetch({ request, response }: HttpContextContract) {
    const requestQuery = await request.validate(GeneralAllValidator)
    const testQuestions = await this.testQuestionService.fetchTestQuestions(requestQuery)
    const filterData = await this.testQuestionService.fetchTestQuestionsFilters()
    return Http.respond(response, 'fetch test questions', testQuestions.toJSON().data, testQuestions.toJSON().meta, filterData)
  }

  /**
   * get test questions with its types and tags
   * @param param0
   * @returns
   */
  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIdValidator)
    const testQuestion = await this.testQuestionService.getTestQuestionWithDependenciesByIdOrFail(id)
    return Http.respond(response, 'get test question', testQuestion)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async delete({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIdValidator)
    const testQuestion = await this.testQuestionService.deleteTestQuestionByIdOrFail(id)
    await this.testService.setOverallScore(testQuestion.test_id)
    return Http.respond(response, 'get test question', testQuestion)
  }

  /**
   * create test question with different types of the question
   * @param param0
   * @returns
   */
  public async create({ request, response }: HttpContextContract) {
    const testQuestionPayload = await request.validate(CreateTestQuestionValidator)
    const questionTypeService = this.questionTypeMapper.typeMapper(testQuestionPayload.type)
    const question = await questionTypeService.createTestQuestion(testQuestionPayload)
    await this.testService.setOverallScore(question.test_id)
    await this.testQuestionService.attachTags(question, testQuestionPayload.tags)
    await question.load('testQuestionTags')
    return Http.respond(response, 'created test question', question)
  }

  /**
   * update test question with different types of the question
   * @param param0
   * @returns
   */
  public async update({ request, response }: HttpContextContract) {
    const testQuestionPayload = await request.validate(UpdateTestQuestionValidator)
    let question = await TestQuestion.findOrFail(testQuestionPayload.test_question_id)
    const questionTypeService = this.questionTypeMapper.typeMapper(question.type)
    question = await questionTypeService.updateTestQuestion(testQuestionPayload.test_question_id, testQuestionPayload)
    await this.testService.setOverallScore(question.test_id)
    await this.testQuestionService.attachTags(question, testQuestionPayload.tags)
    await question.load('testQuestionTags')
    return Http.respond(response, 'updated test question', question)
  }
}
