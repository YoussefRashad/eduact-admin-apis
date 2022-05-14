import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from 'App/Utils/Http'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import ControllersUtils from './ControllersUtils'
import Database from '@ioc:Adonis/Lucid/Database'

export default class IpController {
  public async fetch({ request, response }: HttpContextContract) {
    const { page, perPage, query, sortBy, from, to } = await request.validate(GeneralAllValidator)
    const userQuery = Database.from('users').select('*', 'ips.created_at', 'ips.updated_at').join('ips', 'users.id', 'ips.user_id')
    const searchColumns = ['username', 'email', 'ip_address']
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'ips.' + sortBy.field : sortBy.field
      sortBy.field = sortBy.field === 'updated_at' ? 'ips.' + sortBy.field : sortBy.field
    }
    ControllersUtils.applyAllQueryUtils(userQuery, from, to, null, sortBy, searchColumns, query, 'ips')
    const result = await userQuery.paginate(page, perPage)
    return Http.respond(response, 'ips', result.toJSON().data, result.toJSON().meta)
  }
}
