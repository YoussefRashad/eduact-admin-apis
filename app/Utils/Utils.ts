import { v4 as uuidv4 } from 'uuid'
import { generatePinSync } from 'secure-pin'
import crypto from 'crypto'
import date from 'date-and-time'
import ObjectsToCsv from 'objects-to-csv'
import CsvParser from 'json2csv'

export default class Utils {
  public static generateUUID() {
    return uuidv4().replace(/-/g, '')
  }

  public static generatePinCode(length: number = 6) {
    return generatePinSync(length)
  }

  public static generateUsername(firstname, lastname) {
    return firstname[0].toLowerCase() + lastname[0].toLowerCase() + this.generatePinCode()
  }

  public static generateMixedCaseToken(howMany, chars?) {
    chars = chars || 'abcdefghjmnpqrstuwxyzABCDEFGHJMNPQRSTUWXYZ123456789'
    let rnd = crypto.randomBytes(howMany),
      value = new Array(howMany),
      len = Math.min(256, chars.length),
      d = 256 / len

    for (let i = 0; i < howMany; i++) {
      value[i] = chars[Math.floor(rnd[i] / d)]
    }

    return value.join('')
  }

  static now(format = 'YYYY/MM/DD HH:mm:ss') {
    const now = new Date()
    return date.format(now, format)
  }

  public static exportCsv(response, headers, data, filename = 'data-' + Date.now()) {
    let csv = new ObjectsToCsv(data)
    if (csv.data.length < 1)
      return response
        .header('Content-type', 'text/csv')
        .header('Content-disposition', 'attachment; filename=' + filename + '.csv')
        .header('Accept-Charset', 'UTF-8')
        .send('No Content')
    const csvFields = headers
    const csvParser = new CsvParser.Parser({ csvFields })
    const csvData = csvParser.parse(csv.data)
    return response
      .header('Content-type', 'text/csv')
      .header('Content-disposition', 'attachment; filename=' + filename + '.csv')
      .header('Accept-Charset', 'UTF-8')
      .send(csvData)
  }
  public static generateSerialScratchcard(pad: string, serialNumber: number) {
    return pad.substring(0, pad.length - serialNumber.toString().length) + serialNumber
  }
}
