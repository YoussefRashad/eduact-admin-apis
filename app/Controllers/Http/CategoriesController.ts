import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import CategoryFindValidator from 'App/Validators/CategoryValidators/CategoryFindValidator'
import CategoryCreateValidator from 'App/Validators/CategoryValidators/CategoryCreateValidator'
import Admin from 'App/Models/Admin'
import CategoryUpdateValidator from 'App/Validators/CategoryValidators/CategoryUpdateValidator'
import Http from 'App/Utils/Http'

export default class CategoriesController {
  /**
   * for all categories
   * @param request
   */
  public async categories({ request, response }: HttpContextContract) {
    const { page, perPage, query, filters, sortBy, from, to } = await request.validate(new GeneralAllValidator())
    const categoryQuery = Category.query()
    const searchColumns = ['name']
    ControllersUtils.applyAllQueryUtils(categoryQuery, from, to, filters, sortBy, searchColumns, query)
    const categories = await categoryQuery.paginate(page, perPage)
    return Http.respond(response, 'categories', categories.toJSON().data, categories.toJSON().meta)
  }

  public async category({ request, response }: HttpContextContract) {
    const { id } = await request.validate(new CategoryFindValidator())
    const category = await Category.findByOrFail('id', id)
    return Http.respond(response, 'category', category)
  }

  public async createCategory({ request, response, auth }: HttpContextContract) {
    const { parent_id, name, code, icon } = await request.validate(new CategoryCreateValidator())
    const category = await Category.create({ parent_id, name, code, icon })
    await Admin.logAction(auth.id, 'create category', 'create_category', `Created new Category ${category.name}`)
    return Http.respond(response, 'category', category)
  }

  public async updateCategory({ request, response, auth }: HttpContextContract) {
    const { id, parent_id, name, code, icon } = await request.validate(new CategoryUpdateValidator()) // update validator is same as create
    const category = await Category.findByOrFail('id', id)
    await category.merge({ parent_id, name, code, icon }).save()
    await Admin.logAction(auth.id, 'update category', 'update_category', `Updated Category ${category.name}`)
    return Http.respond(response, 'category', category)
  }

  public async deleteCategory({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(new CategoryFindValidator()) // delete validator is same as get single category validator
    try {
      const deletedCategory = await Category.query().where('id', id).delete()
      return Http.respond(response, 'category', deletedCategory)
    } catch (error) {
      response.status(400).json({ message: 'Cannot delete category' })
    }
  }
}
