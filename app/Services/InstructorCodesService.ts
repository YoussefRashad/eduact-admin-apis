import CustomException from 'App/Exceptions/CustomException'
import csvtojson from 'csvtojson'
import { validate } from 'jsonschema'

export default class InstructorCodesService {
  /**
   *
   * @param request
   * @returns
   */
  public async readfile(request: any) {
    const file: any = await request.file('file')
    if (!file?.isValid) {
      throw new CustomException('unable to read file', 400)
    }
    const fileJson = await csvtojson({
      trim: true,
    }).fromFile(file?.tmpPath)
    const validator = await validate(fileJson, {
      type: 'array',
      items: {
        properties: {
          instructor_id: { type: 'string' },
          code: { type: 'string' },
        },
        required: ['instructor_id', 'code'],
      },
    })
    if (!validator.valid) {
      throw new CustomException(validator.errors[0].toString(), 400)
    }
    return fileJson
  }
}
