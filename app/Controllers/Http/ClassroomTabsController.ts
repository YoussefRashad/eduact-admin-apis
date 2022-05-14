import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Admin from 'App/Models/Admin'
import ClassroomTabs from '../../Models/ClassroomTab'
import RequireIDValidator from 'App/Validators/RequireIDValidator'
import ClassroomTabsUpdateValidator from 'App/Validators/ClassroomTabsValidator/ClassroomTabsUpdateValidator'
import ClassroomTabsCreateValidator from 'App/Validators/ClassroomTabsValidator/ClassroomCreateValidator'
import Http from 'App/Utils/Http'
import CustomException from 'App/Exceptions/CustomException'
import ClassroomTabsUpdateManyValidator from 'App/Validators/ClassroomTabsValidator/ClassroomTabsUpdateManyValidator'
import RequiredClassroomIdValidator from 'App/Validators/ClassroomTabsValidator/RequiredClassroomIdValidator'

export default class ClassroomTabsController {

  /**
   *
   * @param param0
   * @returns
   */
  public async fetch({ response, request }: HttpContextContract) {
    const { classroom_id } = await request.validate(RequiredClassroomIdValidator)
    const classroomTabsQuery = ClassroomTabs.query().preload('sections', (query) => {
      query.orderBy('order')
      query.preload('courses', (query) => {
        query.orderBy('order')
      })
    }).where('classroom_id', classroom_id).orderBy('order')
    const classroomTabs = await classroomTabsQuery.exec()
    return Http.respond(response, 'tabs', classroomTabs)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const tab = await ClassroomTabs.query().preload('sections').where('id', id).firstOrFail()
    return Http.respond(response, 'tabs', tab)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async create({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(ClassroomTabsCreateValidator)
    const newTab = await ClassroomTabs.create(reqObj)
    const tabs = await ClassroomTabs.query().where('classroom_id', newTab.classroom_id).orderBy('order', 'asc').orderBy('updated_at', 'desc') // order by to make sure new tab comes first
    for (let [index, tab] of tabs.entries()) {
      if (tab.order !== index + 1) await tab.merge({ order: index + 1 }).save()
    }
    await Admin.logAction(auth.id, 'create classroom tab', 'create_classroom_tab', `Create new classroom tab ${newTab.name}`)
    return Http.respond(response, 'tab', newTab)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async update({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(ClassroomTabsUpdateValidator)
    const tab = await ClassroomTabs.query().where('id', reqObj.id).firstOrFail()
    await tab.merge(reqObj).save()
    await Admin.logAction(auth.id, 'update classroom tab', 'update_classroom_tab', `Update classroom tab ${tab.name}`)
    return Http.respond(response, 'updated', tab)
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async updateMany({ request, response, auth }: HttpContextContract) {
    const { tabs } = await request.validate(ClassroomTabsUpdateManyValidator)
    if (tabs.length <= 0) throw new CustomException('tabs array is empty', 400)
    for (let tab of tabs) {
      const currentTab = await ClassroomTabs.query().where('id', tab.id).firstOrFail()
      await currentTab.merge(tab).save()
    }
    return Http.respond(response, 'tabs updated')
  }

  /**
   *
   * @param param0
   * @returns
   */
  public async delete({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const tab = await ClassroomTabs.query().where('id', id).firstOrFail()
    const classroomId = tab.classroom_id
    await tab.delete()
    const tabs = await ClassroomTabs.query().where('classroom_id', classroomId).orderBy('order')

    // order tabs after delete
    for (let [index, tab] of tabs.entries()) {
      if (tab.order !== index + 1) await tab.merge({ order: index + 1 }).save()
    }

    await Admin.logAction(auth.id, 'delete classroom tab', 'delete_classroom_tab', `Deleted classroom tab ${tab.name}`)
    return Http.respond(response, 'deleted', tab)
  }
}
