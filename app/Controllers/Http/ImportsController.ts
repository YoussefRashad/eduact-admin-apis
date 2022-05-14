import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import Event from '@ioc:Adonis/Core/Event'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from 'App/Utils/Http'
import ImportService from 'App/Services/ImportService'
import Import from 'App/Models/Import'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'

export default class ImportsController {
  importService: ImportService = new ImportService()

  public async banningStudents({ request, response }: HttpContextContract) {
    const bannedStudents = await this.importService.readfile(request)
    Event.emit('import:ban', { bannedStudents: bannedStudents })
    return Http.respond(response, 'importing in progress..')
  }

  public async enrollStudentsInCourses({ request, response }: HttpContextContract) {
    const studentCourses = await this.importService.readfile(request)
    Event.emit('import:enrollCourses', { studentCourses: studentCourses })
    return Http.respond(response, 'importing in progress..')
  }

  public async enrollStudentsInClassroom({ request, response }: HttpContextContract) {
    const studentClassrooms = await this.importService.readfile(request)
    Event.emit('import:enrollClassrooms', { studentClassrooms: studentClassrooms })
    return Http.respond(response, 'importing in progress..')
  }

  public async imports({ request, response }: HttpContextContract) {
    const { page, perPage, query, filters, sortBy, from, to } = await request.validate(new GeneralAllValidator())
    const importsQuery = Import.query()
    const searchColumns = ['slug', 'description']
    ControllersUtils.applyAllQueryUtils(importsQuery, from, to, filters, sortBy, searchColumns, query)
    if (!sortBy) {
      importsQuery.orderBy('created_at', 'desc')
    }
    const imports = await importsQuery.paginate(page, perPage)
    return Http.respond(response, 'imports', imports.toJSON().data, imports.toJSON().meta)
  }
}
