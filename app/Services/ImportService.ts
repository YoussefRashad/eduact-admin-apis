import CustomException from 'App/Exceptions/CustomException'
import Import from 'App/Models/Import'
import crypto from 'crypto'
import csvtojson from 'csvtojson'
import { validate } from 'jsonschema'

export default class ImportService {
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
          username: { type: 'string' },
          id: { type: 'string' },
          flag: { type: 'string' },
        },
        required: ['username', 'id', 'flag'],
      },
    })
    if (!validator.valid) {
      throw new CustomException(validator.errors[0].toString(), 400)
    }
    return fileJson
  }

  public pushFailed(failed, username, id, message) {
    failed.push({
      username: username,
      id: id,
      reason: message,
    })
  }

  public newImport(description, importedData) {
    return Import.create({
      slug: crypto.randomBytes(10).toString('hex'),
      description: description,
      status: 'pending',
      importedData: JSON.stringify(importedData),
      importedCount: importedData.length,
    })
  }

  public updateImport(id, data) {
    return Import.query().where('id', id).update(data)
  }
}
