import CustomException from "App/Exceptions/CustomException";
import csvtojson from "csvtojson";
import {validate} from "jsonschema";
import User from "App/Models/User";
import { RequestContract } from '@ioc:Adonis/Core/Request'
import Event from "@ioc:Adonis/Core/Event";
import Classroom from "App/Models/Classroom";
import Course from "App/Models/Course";
import crypto from "crypto";
import BulkMessagesHistory from "App/Models/BulkMessagesHistory";
import Import from "App/Models/Import";
import {ModelQueryBuilderContract} from "@ioc:Adonis/Lucid/Orm";

export class BulkMessagesService {

  /**
   *
   * @param request
   */
  public async readfile(request: RequestContract): Promise<Array<{ to : string }>>{
    const file: any = await request.file('file')
    if(!file?.isValid){
      throw new CustomException('unable to read file', 400)
    }
    const fileJson = await csvtojson({
      trim: true,
    }).fromFile(file?.tmpPath)
    const validator = await validate(fileJson, {
      type: 'array',
      items: {
        properties: {
          to: { type: 'string' }
        },
        required: ['to']
      }
    })
    if(!validator.valid){
      throw new CustomException(validator.errors[0].toString(), 400)
    }
    return fileJson
  }

  /**
   *
   * @param payload
   */
  public async prepareUsers(payload: {classrooms: Array<number>, courses: Array<number>, users: Array<number>}): Promise<Array<User>> {
    let users: Array<User> = []
    if (payload.classrooms.includes(0)){
      payload.classrooms.filter((element) => element === 0)
      users = users.concat(await User.query().has('classrooms').pojo())
    }else{
      users = users.concat(
        await User.query().whereHas('classrooms', (query) => {
          query.where('enroll_classrooms.active', true)
          query.whereIn('classroom_id', payload.classrooms)
        }).pojo()
      )
    }
    if (payload.courses.includes(0)){
      payload.courses.filter((element) => element === 0)
      users = users.concat(await User.query().has('courses').pojo())
    }else{
      users = users.concat(
        await User.query().whereHas('courses', (query) => {
          query.whereIn('course_id', payload.courses)
        }).pojo()
      )
    }
    if (payload.users.includes(0)) {
      payload.users.filter((element) => element === 0)
      users = users.concat(await User.query().pojo())
    }else{
      users = users.concat(await User.query().whereIn('id', payload.users).pojo())
    }
    return users
  }

  /**
   *
   * @param method
   * @param users
   * @param content
   * @param subject
   */
  public async mapEvent(method: string, users: Array<User>, content: string, subject?: string): Promise<void>{
    const methodPayloadMapper = {
      email: {
        to: users.map(user => user.email),
        body: content,
        subject: subject
      },
      sms: {
        to: users.map(user => user.phone_number),
        body: content
      },
      whatsapp: {
        to: users.map(user => user.phone_number),
        body: content
      }
    }
    await Event.emit(`sendBulk:${method}`, methodPayloadMapper[method])
  }

  /**
   *
   * @param method
   * @param users
   * @param content
   * @param subject
   */
   public async mapEventwithRawData(method: string, sendTo: Array<{to: string}>, content: string, subject?: string): Promise<void>{
    const methodPayloadMapper = {
      email: {
        to: sendTo.map(element => element.to),
        body: content,
        subject: subject
      },
      sms: {
        to: sendTo.map(element => element.to),
        body: content
      },
      whatsapp: {
        to: sendTo.map(element => element.to),
        body: content
      }
    }
    await Event.emit(`sendBulk:${method}`, methodPayloadMapper[method])
  }

  /**
   *
   * @param query
   */
  public async search(query: string): Promise<{ classrooms: Array<Classroom>, courses: Array<Course>, users: Array<User> }>{
    const classrooms = await Classroom.query().select('id', 'title', 'label').where('title', 'ilike', `%${query}%`)
    const courses = await Course.query().select('id', 'name', 'code').where('name', 'ilike', `%${query}%`)
    const users = await User.query().select('id', 'username').where('username', 'ilike', `%${query}%`)
    return {classrooms, courses, users}
  }

  /**
   *
   * @param description
   * @param importedData
   * @param via
   * @param content
   * @param subject
   */
  public async newBulkMessage(description: string, importedData: Array<string>, via: string, content: string, subject?: string): Promise<BulkMessagesHistory>{
    return BulkMessagesHistory.create({
      slug: crypto.randomBytes(10).toString('hex'),
      description: description,
      status: 'pending',
      sentToData: JSON.stringify(importedData),
      sentToCount: importedData.length,
      via: via,
      content: content,
      subject: subject
    })
  }

  /**
   *
   * @param id
   * @param data
   */
  public updateBulkMessages(id: number, data: any): ModelQueryBuilderContract<typeof BulkMessagesHistory>{
    return BulkMessagesHistory.query().where('id', id).update(data)
  }
}
