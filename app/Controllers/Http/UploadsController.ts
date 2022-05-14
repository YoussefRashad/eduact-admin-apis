import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UploadService from 'App/Services/UploadService'
import Http from 'App/Utils/Http'
import UploadDocumentValidator from 'App/Validators/UploadValidators/UploadDocumentValidator'
import UploadPhotoValidator from 'App/Validators/UploadValidators/UploadPhotoValidator'

export default class UploadsController {
  uploadService = new UploadService()

  /**
   *
   * @param param0
   */
  public async uploadPhoto({ request, response }: HttpContextContract) {
    const { photo, folder } = await request.validate(UploadPhotoValidator)
    const uri = await this.uploadService.upload(photo, folder)
    return Http.respond(response, 'Classroom Photo upload successfully', uri)
  }

  /**
   *
   * @param param0
   */
  public async uploadDocument({ request, response }: HttpContextContract) {
    const { document } = await request.validate(UploadDocumentValidator)
    const uri = await this.uploadService.upload(document, 'documents')
    return Http.respond(response, 'Classroom Photo upload successfully', uri)
  }
}
