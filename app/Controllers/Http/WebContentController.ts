import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnitService from 'App/Services/UnitService'
import WebContentService from 'App/Services/WebContentService'
import Http from 'App/Utils/Http'
import CreatWebContentValidator from 'App/Validators/WebContentValidators/CreatWebContentValidator'
import GetWebContentValidator from 'App/Validators/WebContentValidators/GetWebContentValidator'
import UpdateWebContentValidator from 'App/Validators/WebContentValidators/UpdateWebContentValidator'

export default class WebContentController {
  webContentService = new WebContentService()
  unitService = new UnitService()

  /**
   *
   * @param request
   * @param response
   */
  public async create({ request, response }: HttpContextContract) {
    const { unit, webContent } = await request.validate(CreatWebContentValidator)
    const unitModel = await this.unitService.createUnit(unit)
    const webContentModel = await this.webContentService.createWebContent({ unitId: unitModel.id, ...webContent })
    return Http.respond(response, 'Create Web Content', { webContentModel, unit })
  }

  /**
   *
   * @param request
   * @param response
   */
  public async update({ request, response }: HttpContextContract) {
    const { webContent, unit, webContentId } = await request.validate(UpdateWebContentValidator)
    const webContentModel = await this.webContentService.getWebContentByIdOrFail(webContentId)
    await Promise.all([
      this.unitService.updateUnit(webContentModel.unitId, unit),
      this.webContentService.updateWebContent(webContentModel, webContent),
    ])

    return Http.respond(response, 'Update Web Content', { webContentModel })
  }

  /**
   *
   * @param request
   * @param response
   */
  async get({ request, response }: HttpContextContract) {
    const { webContentId } = await request.validate(GetWebContentValidator)
    const webContent = await this.webContentService.getWebContentByIdOrFail(webContentId)
    await webContent.load('unit')
    return Http.respond(response, 'Get Web Content', { webContent })
  }

  /**
   *
   * @param request
   * @param response
   */
  async delete({ request, response }: HttpContextContract) {
    const { webContentId } = await request.validate(GetWebContentValidator)
    const webContent = await this.webContentService.getWebContentByIdOrFail(webContentId)
    await webContent.load('unit')
    await webContent.unit.delete()
    await webContent.delete()
    return Http.respond(response, 'Delete Web Content', { webContent })
  }
}
