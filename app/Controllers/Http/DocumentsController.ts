import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DocumentService from 'App/Services/DocumentService'
import CreateDocumentValidator from 'App/Validators/DocumentValidator/CreateDocumentValidator'
import UnitService from 'App/Services/UnitService'
import Http from 'App/Utils/Http'
import UpdateDocumentValidator from 'App/Validators/DocumentValidator/UpdateDocumentValidator'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'

export default class DocumentsController {
  unitService = new UnitService()
  documentService = new DocumentService()
  /**
   *
   * @param param0
   * @returns
   */
  public async create({ request, response }: HttpContextContract) {
    const { document, unit } = await request.validate(CreateDocumentValidator)
    const unitData = await this.unitService.createUnit(unit)
    const documentData = await this.documentService.createDocument({
      unit_id: unitData.id,
      ...document,
    })
    return Http.respond(response, 'create document', { unitData, documentData })
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async update({ request, response }: HttpContextContract) {
    const { document_id, document_data, unit_data } = await request.validate(UpdateDocumentValidator)
    const document = await this.documentService.getDocumentByIdOrFail(document_id)
    await Promise.all([this.unitService.updateUnit(document.unit_id, unit_data), this.documentService.updateDocument(document, document_data)])
    return Http.respond(response, 'update document', document)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async fetch({ request, response }: HttpContextContract) {
    const requestQuery = await request.validate(GeneralAllValidator)
    const documents = await this.documentService.fetchDocument(requestQuery)
    return Http.respond(response, 'documents', documents.toJSON().data, documents.toJSON().meta)
  }
}
