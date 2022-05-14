import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import Document from '../Models/Document'

export default class DocumentService {
  /**
   *
   * @param document
   * @returns
   */
  public async createDocument(document: Partial<Document>) {
    return Document.create(document)
  }
  /**
   *
   * @param document_id
   * @returns
   */
  public async getDocumentByIdOrFail(document_id: number) {
    return Document.query().where('id', document_id).firstOrFail()
  }
  /**
   *
   * @param document
   * @param data
   * @returns
   */
  public async updateDocument(document: Document, data: any) {
    return document.merge(data).save()
  }
  /**
   *
   * @param queryParams
   * @returns
   */
  public async fetchDocument(queryParams: any) {
    const { page, perPage, from, to, filters, sortBy, query } = queryParams
    const searchColumns = ['file_name']
    const documentQuery = Document.query()
    ControllersUtils.applyAllQueryUtils(documentQuery, from, to, filters, sortBy, searchColumns, query)
    return documentQuery.preload('unit').paginate(page, perPage)
  }
}
