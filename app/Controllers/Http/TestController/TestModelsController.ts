import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RequireIDValidator from 'App/Validators/RequireIDValidator'
import TestModelService from 'App/Services/TestService/TestModelService'
import TestModel from 'App/Models/TestModel'
import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import Http from 'App/Utils/Http'
import CreateTestModelValidator from 'App/Validators/TestValidator/CreateTestModelValidator'
import UpdateTestModelValidator from 'App/Validators/TestValidator/UpdateTestModelValidator'
import Test from 'App/Models/Test'

export default class TestModelsController {
  private testModelService = new TestModelService()

  /**
   *
   * @param request
   * @param response
   */
  public async getTestModel({ request, response }: HttpContextContract) {
    const payload = await request.validate(RequireIDValidator)
    const testModel = await TestModel.query().where('id', payload.id).preload('modelQuestions').first()
    if (!testModel) {
      throw new ResourceNotFoundException('Test model not found')
    }
    return Http.respond(response, 'test model', testModel)
  }

  /**
   *
   * @param request
   * @param response
   */
  public async createTestModel({ request, response }: HttpContextContract) {
    const { modelQuestions, ...model } = await request.validate(CreateTestModelValidator)
    if (await this.testModelService.isTestActive(model.test_id)) {
      throw new ForbiddenException('Cannot create model from an active test')
    }
    const testModel: TestModel = await TestModel.create(model)
    if (modelQuestions) {
      await this.testModelService.setModelQuestions(modelQuestions, testModel)
      await Test.query()
        .where('id', testModel.test_id)
        .update({
          overall_score: await this.testModelService.getTestModelQuestionsWeights(testModel.id),
        })
    }
    await this.testModelService.setTestMode(testModel.test_id)
    return Http.respond(response, 'created')
  }

  /**
   *
   * @param request
   * @param response
   */
  public async updateTestModel({ request, response }: HttpContextContract) {
    const { modelQuestions, ...model } = await request.validate(UpdateTestModelValidator)
    const testModel = await TestModel.find(model.id)
    if (!testModel) {
      throw new ResourceNotFoundException('Test model not found')
    }
    if (await this.testModelService.isTestActive(testModel.test_id)) {
      throw new ForbiddenException('Cannot delete model from an active test')
    }
    await TestModel.query().where('id', testModel.id).update(model)
    if (modelQuestions) {
      await this.testModelService.setModelQuestions(modelQuestions, testModel)
      await Test.query()
        .where('id', testModel.test_id)
        .update({
          overall_score: await this.testModelService.getTestModelQuestionsWeights(testModel.id),
        })
    }
    await this.testModelService.setTestMode(testModel.test_id)
    return Http.respond(response, 'updated')
  }

  /**
   *
   * @param request
   * @param response
   */
  public async deleteTestModel({ request, response }: HttpContextContract) {
    const payload = await request.validate(RequireIDValidator)
    const testModel = await TestModel.find(payload.id)
    if (!testModel) {
      throw new ResourceNotFoundException('Test model not found')
    }
    if (await this.testModelService.isTestActive(testModel.test_id)) {
      throw new ForbiddenException('Cannot delete model from an active test')
    }
    await testModel.delete()
    await this.testModelService.setTestMode(testModel.test_id)
    return Http.respond(response, 'deleted')
  }
}
