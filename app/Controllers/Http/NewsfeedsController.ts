import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Newsfeed from 'App/Models/Newsfeed'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import NewsfeedGetValidator from 'App/Validators/NewsfeedValidators/NewsfeedGetValidator'
import NewsfeedCreateValidator from 'App/Validators/NewsfeedValidators/NewsfeedCreateValidator'
import Admin from 'App/Models/Admin'
import NewsfeedUpdateValidator from 'App/Validators/NewsfeedValidators/NewsfeedUpdateValidator'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'

export default class NewsfeedsController {
  public async newsfeeds({ request, response }: HttpContextContract) {
    const { page, perPage, from, to, filters, sortBy, query } = await request.validate(GeneralAllValidator)
    const newsfeedsQuery = Newsfeed.query()
    const searchColumns = ['description', 'content', 'redirection_url']
    ControllersUtils.applyAllQueryUtils(newsfeedsQuery, from, to, filters, sortBy, searchColumns, query)
    const newsfeeds = await newsfeedsQuery.paginate(page, perPage)
    const filterData = await this.fetchNewsFeedsFilters()
    return Http.respond(response, 'newwsfeed', newsfeeds.toJSON().data, newsfeeds.toJSON().meta, filterData)
  }

  public async fetchNewsFeedsFilters() {
    const filters = await new DataFilter({
      model: Newsfeed,
      filterObjects: [
        {
          name: 'Is Active',
          value: 'is_active',
          optionNameColumn: 'is_active',
          optionValueColumn: 'is_active',
        },
      ],
    }).process()
    return filters
  }

  public async newsfeed({ request, response }: HttpContextContract) {
    const { id } = await request.validate(NewsfeedGetValidator)
    const newsfeed = await Newsfeed.query().where('id', id).firstOrFail()
    return Http.respond(response, 'newwsfeed', newsfeed)
  }

  public async createNewsfeed({ request, response, auth }: HttpContextContract) {
    const { content, photo, redirection_url, is_active } = await request.validate(NewsfeedCreateValidator)
    const newsfeed = await Newsfeed.create({ content, photo, redirection_url, is_active })
    await Admin.logAction(auth.id, 'create newsfeed', 'create_newsfeed', `Created new Newsfeed ${content}`)
    return Http.respond(response, 'newwsfeed created', newsfeed)
  }

  public async updateNewsfeed({ request, response, auth }: HttpContextContract) {
    const { id, ...reqBody } = await request.validate(NewsfeedUpdateValidator)
    const newsfeed = await Newsfeed.query().where('id', id).firstOrFail()
    await newsfeed.merge(reqBody).save()
    await Admin.logAction(auth.id, 'update newsfeed', 'update_newsfeed', `Updated newsfeed ${reqBody.content}`)
    return Http.respond(response, 'newwsfeed updated', newsfeed)
  }

  public async deleteNewsfeed({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(NewsfeedGetValidator) // delete validator same as get
    await Newsfeed.query().where('id', id).delete() // gets the list of deleted newsfeed id's
    await Admin.logAction(auth.id, 'delete newsfeed', 'delete_newsfeed', `Deleted Newsfeed ${id}`)
    return Http.respond(response, 'newwsfeed deleted')
  }
}
