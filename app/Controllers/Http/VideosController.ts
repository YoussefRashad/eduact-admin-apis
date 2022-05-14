import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VideoService from 'App/Services/VideoService'
import UnitService from 'App/Services/UnitService'
import CreateVideoValidator from 'App/Validators/VideoValidators/CreateVideoValidator'
import Http from 'App/Utils/Http'
import GetVideoValidator from 'App/Validators/VideoValidators/GetVideoValidators'
import UpdateVideoValidator from 'App/Validators/VideoValidators/UpdateVideoValidator'

export default class VideosController {
  videoService = new VideoService()
  unitService = new UnitService()

  /**
   *
   * @param request
   * @param response
   */
  public async create({ request, response }: HttpContextContract) {
    const { video, unit } = await request.validate(CreateVideoValidator)
    const unitModel = await this.unitService.createUnit(unit)
    const videoModel = await this.videoService.createVideo({
      unitId: unitModel.id,
      ...video,
    })
    return Http.respond(response, 'create Video', { unitModel, videoModel })
  }

  /**
   *
   * @param request
   * @param response
   */
  public async get({ request, response }: HttpContextContract) {
    const { videoId } = await request.validate(GetVideoValidator)
    const video = await this.videoService.getDocumentByIdOrFail(videoId)
    await video.load('unit')
    return Http.respond(response, 'Video', { video })
  }

  /**
   *
   * @param request
   * @param response
   */
  public async update({ request, response }: HttpContextContract) {
    const { videoId, unit, video } = await request.validate(UpdateVideoValidator)
    const videoModel = await this.videoService.getDocumentByIdOrFail(videoId)
    await Promise.all([await this.unitService.updateUnit(videoModel.unitId, unit), await this.videoService.updatevideo(videoModel, video)])
    return Http.respond(response, 'update video', { videoModel })
  }

  /**
   *
   * @param request
   * @param response
   */
  public async delete({ request, response }: HttpContextContract) {
    const { videoId } = await request.validate(GetVideoValidator)
    const video = await this.videoService.getDocumentByIdOrFail(videoId)
    await video.load('unit')
    await video.delete()
    await video.unit.delete()
    return Http.respond(response, 'Delete Video', { video })
  }
}
