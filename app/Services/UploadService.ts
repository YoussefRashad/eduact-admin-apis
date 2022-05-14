import CustomException from '../Exceptions/CustomException'
import Env from '@ioc:Adonis/Core/Env'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'

export default class UploadService {
  public async upload(file: MultipartFileContract, folder: string = 'uncategorized') {
    let fileName = file.clientName.split('.')[0].split(' ').join('')
    const path = `${fileName}${Date.now()}.${file.extname}`
    try {
      await new Promise(res => setTimeout(res, 200))
      await file.moveToDisk(
        folder,
        {
          name: path,
          visibility: 'public',
        },
        's3'
      )
      const imagePath = `${Env.get('S3_ENDPOINT')}/${Env.get('S3_BUCKET')}/${folder}/${path}`
      return {
        uri: imagePath,
        extension: file.extname,
        size: file.size,
        file_name: fileName,
      }
    } catch (error) {
      throw new CustomException('file upload failed: ' + error.message)
    }
  }
}
