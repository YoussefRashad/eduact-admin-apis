import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import WebinarSlot from 'App/Models/WebinarSlot'
import Webinar from '../Models/Webinar'

export default class WebinarService {
  /**
   *
   * @param webinar
   * @returns
   */
  public async createWebinar(webinar: Partial<Webinar>) {
    return Webinar.create(webinar)
  }
  /**
   *
   * @param webinarId
   * @returns
   */
  public async getWebinarByIdOrFail(webinarId: number) {
    return Webinar.query().where('id', webinarId).firstOrFail()
  }
  /**
   *
   * @param webinar
   * @param data
   * @returns
   */
  public async updateWebinar(webinar: Webinar, data: Partial<Webinar> | undefined) {
    if (data) await webinar.merge(data).save()
  }

  /**
   *
   * @param webinarId
   * @returns
   */
  public async deleteWebinar(webinarId: number) {
    const webinar = await this.getWebinarByIdOrFail(webinarId)
    await webinar.load('unit')
    await webinar.unit.delete()
    await webinar.delete()
    return webinar
  }

  /**
   *
   * @param queryParams
   * @returns
   */
  public async fetchWebinar(queryParams: any) {
    const { page, perPage, from, to, filters, sortBy, query } = queryParams
    const searchColumns = ['name', 'description']
    const webinarQuery = Webinar.query()
    ControllersUtils.applyAllQueryUtils(webinarQuery, from, to, filters, sortBy, searchColumns, query)
    return webinarQuery.preload('unit').preload('webinarSlots').paginate(page, perPage)
  }

  /**
   *
   * @param webinarId
   * @param slots
   * @returns
   */
  public async addSlots(webinarId: number, slots: Partial<WebinarSlot>[]) {
    const webinar = await this.getWebinarByIdOrFail(webinarId)
    await Promise.all(
      slots.map(async (slot) => {
        await WebinarSlot.create({ webinar_id: webinarId, ...slot })
      })
    )
    await webinar.load('webinarSlots')
    return webinar
  }

  /**
   *
   * @param slotId
   * @returns
   */
  public async getSlotOrFail(slotId: number) {
    return WebinarSlot.findOrFail(slotId)
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public async updateSlot(id: number, data: Partial<WebinarSlot>) {
    const slot = await this.getSlotOrFail(id)
    await slot.merge(data).save()
    return slot
  }

  /**
   *
   * @param id
   * @returns
   */
  public async deleteSlot(id: number) {
    const webinar = await this.getSlotOrFail(id)
    await webinar.delete()
    return webinar
  }
}
