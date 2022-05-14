import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RequireIdValidator from 'App/Validators/RequireIDValidator'
import CreateTagValidator from 'App/Validators/TestValidator/TagValidators/CreateTagValidator'
import UpdateTagValidator from 'App/Validators/TestValidator/TagValidators/UpdateTagValidator'
import Http from 'App/Utils/Http'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import Tag from 'App/Models/Tag'
import ControllersUtils from '../ControllersUtils'

export default class TagsController {
  public async fetch({ request, response }: HttpContextContract) {
    const { page, perPage, filters, query, sortBy, from, to } = await request.validate(GeneralAllValidator)
    const documentQuery = Tag.query()
    const searchColumns = ['name']
    ControllersUtils.applyAllQueryUtils(documentQuery, from, to, filters, sortBy, searchColumns, query)
    const tags = await documentQuery.paginate(page, perPage)
    return Http.respond(response, 'fetch tags', tags.toJSON().data, tags.toJSON().meta)
  }

  public async getOne({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIdValidator)
    const tag = await Tag.query().where('id', id).preload('testQuestionTags').firstOrFail()
    return Http.respond(response, 'get a tag', tag)
  }

  public async create({ request, response }: HttpContextContract) {
    const resBody = await request.validate(CreateTagValidator)
    const tag = await Tag.create(resBody)
    return Http.respond(response, 'created a tag', tag)
  }

  public async update({ request, response }: HttpContextContract) {
    const resBody = await request.validate(UpdateTagValidator)
    const tag = await Tag.query().where('id', resBody.id).firstOrFail()
    await tag.merge(resBody).save()
    return Http.respond(response, 'updated a tag', tag)
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIdValidator)
    const tag = await Tag.query().where('id', id).firstOrFail()
    await tag.delete()
    return Http.respond(response, 'deleted a tag', tag)
  }
}
