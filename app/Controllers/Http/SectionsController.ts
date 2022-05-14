import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import Admin from 'App/Models/Admin'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import Section from '../../Models/Section'
import RequireIDValidator from 'App/Validators/RequireIDValidator'
import SectionUpdateValidator from 'App/Validators/SectionValidator/SectionUpdateValidator'
import SectionCreateValidator from 'App/Validators/SectionValidator/SectionCreateValidator'
import Http from 'App/Utils/Http'
import SectionUpdateManyValidator from 'App/Validators/SectionValidator/SectionUpdateManyValidator'
import CustomException from 'App/Exceptions/CustomException'

export default class SectionsController {
  public async fetch({ request, response }: HttpContextContract) {
    const { page, perPage, query, filters, sortBy, from, to } = await request.validate(new GeneralAllValidator())
    const sectionQuery = Section.query()
    const searchColumns = ['name', 'classroom_tab_id', 'order']
    ControllersUtils.applyAllQueryUtils(sectionQuery, from, to, filters, sortBy, searchColumns, query, 'sections')
    const section = await sectionQuery.paginate(page, perPage)
    return Http.respond(response, 'section', section.toJSON().data, section.toJSON().meta)
  }

  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const section = await Section.query().where('id', id).firstOrFail()
    return Http.respond(response, 'section', section)
  }

  public async create({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(SectionCreateValidator)
    const section = await Section.create(reqObj)
    await Admin.logAction(auth.id, 'create section', 'create_section', `Create new section ${section.name}`)
    return Http.respond(response, 'section', section)
  }

  public async update({ request, response, auth }: HttpContextContract) {
    const reqObj = await request.validate(SectionUpdateValidator)
    const section = await Section.query().where('id', reqObj.id).firstOrFail()
    await section.merge(reqObj).save()
    await Admin.logAction(auth.id, 'update section', 'update_section', `Update section ${section.name}`)
    return Http.respond(response, 'updated', section)
  }

  public async updateMany({ request, response, auth }: HttpContextContract) {
    const { sections } = await request.validate(SectionUpdateManyValidator)
    if (sections.length <= 0) throw new CustomException('sections array is empty', 400)
    for (let reqSection of sections) {
      const section = await Section.query().where('id', reqSection.id).firstOrFail()
      await section.merge(reqSection).save()
    }
    await Admin.logAction(
      auth.id,
      'update many sections',
      'update_many_sections',
      `Update many sections, id's: ${sections.map((section) => section.id).toString()}`
    )
    return Http.respond(response, 'sections updated')
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(RequireIDValidator)
    const section = await Section.query().where('id', id).firstOrFail()
    const tabId = section.classroomTabId
    await section.delete()
    const sections = await Section.query().where('classroom_tab_id', tabId)

    // order sections after delete
    for (let [index, section] of sections.entries()) {
      if (section.order !== index + 1) await section.merge({ order: index + 1 }).save()
    }

    await Admin.logAction(auth.id, 'delete section', 'delete_section', `Deleted section ${section.name}`)
    return Http.respond(response, 'deleted', section)
  }
}
