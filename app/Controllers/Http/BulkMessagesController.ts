import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from "App/Utils/Http";
import User from "App/Models/User";
import BulkMessagesSendRequestValidator from "App/Validators/BulkMessages/BulkMessagesSendRequestValidator";
import {BulkMessagesService} from "App/Services/BulkMessagesService";
import BulkMessagesImportRequestValidator from "App/Validators/BulkMessages/BulkMessagesImportRequestValidator";
import GeneralAllValidator from "App/Validators/GeneralAllValidator";
import ControllersUtils from "App/Controllers/Http/ControllersUtils";
import BulkMessagesHistory from "App/Models/BulkMessagesHistory";

export default class BulkMessagesController {

  private bulkMessagesService = new BulkMessagesService()

  public async fetchHistory({request, response}: HttpContextContract){
    const { page, perPage, query, filters, sortBy, from, to } = await request.validate(new GeneralAllValidator())
    const bulkMessagesHistoryQuery = BulkMessagesHistory.query()
    const searchColumns = ['slug', 'description']
    ControllersUtils.applyAllQueryUtils(bulkMessagesHistoryQuery, from, to, filters, sortBy, searchColumns, query)
    if(!sortBy) {
      bulkMessagesHistoryQuery.orderBy('created_at', 'desc')
    }
    const messagesHistory = await bulkMessagesHistoryQuery.paginate(page, perPage)
    return Http.respond(response, 'History', messagesHistory.toJSON().data, messagesHistory.toJSON().meta)
  }

  /**
   *
   * @param params
   * @param response
   */
  public async search({params, response}: HttpContextContract) {
    const {classrooms, courses, users} = await this.bulkMessagesService.search(params.query)
    return Http.respond(response, 'result', {
      classrooms: classrooms,
      courses: courses,
      users: users
    })
  }

  /**
   *
   * @param request
   * @param response
   */
  public async send({request, response}: HttpContextContract) {
    const payload = await request.validate(BulkMessagesSendRequestValidator)
    const users: Array<User> = await this.bulkMessagesService.prepareUsers(payload)
    await this.bulkMessagesService.mapEvent(payload.via, users, payload.content, payload.subject)
    return Http.respond(response, 'Message sent')
  }

  /**
   *
   * @param request
   * @param response
   */
  public async import({request, response}: HttpContextContract){
    const file: Array<{ to : string }> = await this.bulkMessagesService.readfile(request)
    const payload = await request.validate(BulkMessagesImportRequestValidator)
    await this.bulkMessagesService.mapEventwithRawData(payload.via, file, payload.content, payload.subject)
    return Http.respond(response, 'Message sent')
  }
}
