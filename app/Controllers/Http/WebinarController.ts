import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnitService from 'App/Services/UnitService'
import WebinarService from 'App/Services/WebinarService'
import Http from 'App/Utils/Http'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import AddSlotsValidator from 'App/Validators/WebinarValidator/AddSlotsValidator'
import CreateWebinarValidator from 'App/Validators/WebinarValidator/CreateWebinarValidator'
import UpdateWebinarValidator from 'App/Validators/WebinarValidator/UpdateWebinarValidator'
import RequireIDValidator from '../../Validators/RequireIDValidator'
import UpdateSlotsValidator from '../../Validators/WebinarValidator/UpdateSlotValidator'

export default class WebinarController {
  unitService = new UnitService()
  webinarService = new WebinarService()
  /**
   *
   * @param param0
   * @returns
   */
  public async create({ request, response }: HttpContextContract) {
    const { webinar, unit } = await request.validate(CreateWebinarValidator)
    const unitData = await this.unitService.createUnit(unit)
    const webinarData = await this.webinarService.createWebinar({
        unit_id: unitData.id,
        ...webinar,
        name: webinar.name ?? unit.name ?? `webinar ${unitData.id}`  
    })
    await webinarData.load('unit')
    return Http.respond(response, 'create webinar', webinarData)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async update({ request, response }: HttpContextContract) {
    const { webinar_id, webinar, unit } = await request.validate(UpdateWebinarValidator)
    const webinarResult = await this.webinarService.getWebinarByIdOrFail(webinar_id)
    await Promise.all([this.unitService.updateUnit(webinarResult.unit_id, unit), this.webinarService.updateWebinar(webinarResult, webinar)])
    await webinarResult.load('unit')
    await webinarResult.load('webinarSlots')
    return Http.respond(response, 'update webinar', webinarResult)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const webinar = await this.webinarService.getWebinarByIdOrFail(id)
    await webinar.load('unit')
    await webinar.load('webinarSlots')
    return Http.respond(response, 'webinar', webinar)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async fetch({ request, response }: HttpContextContract) {
    const requestQuery = await request.validate(GeneralAllValidator)
    const webinars = await this.webinarService.fetchWebinar(requestQuery)
    return Http.respond(response, 'webinars', webinars.toJSON().data, webinars.toJSON().meta)
  }

  /**
   *
   * @param param0
   */
  public async delete({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const webinar = await this.webinarService.deleteWebinar(id)
    return Http.respond(response, 'Delete webinar', webinar)
  }

  /**
   *
   * @param param0
   */
  public async addSlots({ request, response }: HttpContextContract) {
    const { webinar_id, slots } = await request.validate(AddSlotsValidator)
    const webinarSlots = await this.webinarService.addSlots(webinar_id, slots)
    return Http.respond(response, 'Add webinar slots', webinarSlots)
  }

  /**
   *
   * @param param0
   */
  public async updateSlot({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateSlotsValidator)
    const webinarSlot = await this.webinarService.updateSlot(payload.id, payload)
    return Http.respond(response, 'Update webinar slot', webinarSlot)
  }

  /**
   *
   * @param param0
   */
  public async deleteSlot({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const webinarSlot = await this.webinarService.deleteSlot(id)
    return Http.respond(response, 'Delete webinar', webinarSlot)
  }
}
