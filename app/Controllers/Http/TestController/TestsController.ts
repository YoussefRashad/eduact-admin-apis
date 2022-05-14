import CreateTestValidator from 'App/Validators/TestValidator/CreateTestValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnitService from 'App/Services/UnitService'
import TestService from 'App/Services/TestService/TestService'
import Http from 'App/Utils/Http'
import UpdateTestValidator from 'App/Validators/TestValidator/UpdateTestValidator'
import CustomException from 'App/Exceptions/CustomException'
import GetTestValidator from 'App/Validators/TestValidator/GetTestValidator'
import GradeScheme from 'App/Models/GradeScheme'
export default class {
  private unitService = new UnitService()
  private testService = new TestService()

  /**
   *
   * @param param0
   * @returns
   */
  async create({ request, response }: HttpContextContract) {
    let { unit, test, gradeSchema } = await request.validate(CreateTestValidator)
    await this.testService.validateGradeSchema(gradeSchema)
    const unitModel = await this.unitService.createUnit(unit)
    const testModel = await this.testService.createTest({ ...test, unit_id: unitModel.id }!, unit)
    let gradeSchemaModel: GradeScheme[] | undefined
    gradeSchemaModel = await this.testService.addGradeSchema(testModel, gradeSchema)
    return Http.respond(response, 'Create test', { unit: unitModel, test: testModel, gradeSchema: gradeSchemaModel })
  }

  /**
   *
   * @param param0
   * @returns
   */
  async update({ request, response }: HttpContextContract) {
    const { id, unit, test, gradeSchema } = await request.validate(UpdateTestValidator)
    await this.testService.validateGradeSchema(gradeSchema)
    const testModel = await this.testService.findTestOrFail(id)
    if (testModel?.active) throw new CustomException("Active test can't be updated", 422)
    if (unit) await this.unitService.updateUnit(testModel.unit_id, unit)
    await this.testService.updateTest(testModel, test!)
    await this.testService.addGradeSchema(testModel, gradeSchema)
    await testModel.load('unit')
    return Http.respond(response, 'Update Test', { test: testModel })
  }

  /**
   *
   * @param param0
   * @returns
   */
  async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetTestValidator)
    const testModel = await this.testService.findTestOrFail(id)
    await testModel.load('questions', (query) => {
      query.preload('fillInTheGapQuestions').preload('multipleChoiceQuestions').preload('orderingQuestions').preload('testQuestionTags')
    })
    return Http.respond(response, 'Get Test', { test: testModel })
  }

  /**
   *
   * @param param0
   * @returns
   */
  async delete({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetTestValidator)
    const testModel = await this.testService.findTestOrFail(id)
    await testModel.delete()
    return Http.respond(response, 'Delete test', { test: testModel })
  }

  /**
   *
   * @param param0
   * @returns
   */
  async activate({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetTestValidator)
    const testModel = await this.testService.findTestOrFail(id)
    await this.testService.validateTest(testModel)
    await this.testService.updateTest(testModel, {
      active: true,
      activeStartDate: null,
      activeEndDate: null,
    })
    await testModel.refresh()
    return Http.respond(response, 'changed test activision', { test: testModel })
  }
  /**
   *
   * @param param0
   * @returns
   */
  async deactivate({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetTestValidator)
    const testModel = await this.testService.findTestOrFail(id)
    if (!testModel.active) throw new CustomException("test isn't active", 422)
    await this.testService.updateTest(testModel, {
      active: false,
      activeStartDate: null,
      activeEndDate: null,
    })
    await testModel.refresh()
    return Http.respond(response, 'test deacticated', { test: testModel })
  }
}
