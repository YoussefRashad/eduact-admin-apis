import CustomException from 'App/Exceptions/CustomException';
import Event from '@ioc:Adonis/Core/Event';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from 'App/Utils/Http'
import InstructorCodesService from 'App/Services/InstructorCodesService'
import InstructorCode from 'App/Models/InstructorCode';
import Instructor from 'App/Models/Instructor';

export default class InstructorCodesController {

  instructorCodesService = new InstructorCodesService()

  /**
   *
   * @param param0
   */
  public async import({request, response}: HttpContextContract) {
    let codes: Array<any> = await this.instructorCodesService.readfile(request)
    codes = [...new Map(codes.map(item => [item['instructor_id']+item['code'], item])).values()] //remove duplicate objects
    const instructorsIds = [...new Set(codes.map(e => e.instructor_id))]
    const instructors = await Instructor.query().whereIn('user_id', instructorsIds)
    //instructor ids checks
    if(instructorsIds.length === 0) {
      throw new CustomException('Empty file exception', 400)
    }
    if(instructors.length !== instructorsIds.length) {
      throw new CustomException('Invalid Instructor id', 400)
    }
    //codes check
    const duplicateDbCode = await InstructorCode.query().whereIn(['instructor_id', 'code'], codes.map(e => [e.instructor_id, e.code])).first()
    if(duplicateDbCode){
      throw new CustomException('Some codes are already in use', 400)
    }
    await InstructorCode.createMany(codes)
    return Http.respond(response, 'instructor codes', codes)
  }
}
