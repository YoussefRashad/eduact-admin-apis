import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import Video from '../Models/Video'

export default class VideoService {
  /**
   *
   * @param video
   * @returns
   */
  public async createVideo(video: Partial<Video>) {
    return Video.create(video)
  }

  /**
   *
   * @param video_id
   * @returns
   */
  public async getDocumentByIdOrFail(video_id: number) {
    return Video.query().where('id', video_id).firstOrFail()
  }

  /**
   *
   * @param video
   * @param data
   * @returns
   */
  public async updatevideo(video: Video, data: any) {
    return video.merge(data).save()
  }
}
