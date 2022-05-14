import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import WebContent from 'App/Models/WebContent'
export default class WebContentService {
  /**
   *
   * @param webContent
   * @returns
   */
  public async createWebContent(webContent: Partial<WebContent>) {
    return WebContent.create(webContent)
  }
  /**
   *
   * @param webContentId
   * @returns
   */
  public async getWebContentByIdOrFail(webContentId: number) {
    return WebContent.query().where('id', webContentId).firstOrFail()
  }
  /**
   *
   * @param webContent
   * @param data
   * @returns
   */
  public async updateWebContent(webContent: WebContent, data: any) {
    return webContent.merge(data).save()
  }
}
