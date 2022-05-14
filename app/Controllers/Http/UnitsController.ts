import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateUnitsValidator from 'App/Validators/UnitsValidator/UpdateUnitsValidator'
import Unit from 'App/Models/Unit'
import Http from 'App/Utils/Http'
import UpdateUnitValidator from 'App/Validators/UnitsValidator/UpdateUnitValidator'
import RequireIDValidator from 'App/Validators/RequireIDValidator'

export default class UnitsController {
  /**
   *
   * @param request
   * @param response
   */
  public async updateUnits({ request, response }: HttpContextContract) {
    const payload = await request.validate(UpdateUnitsValidator)
    for (const unit of payload.units) {
      await Unit.query().where('id', unit.id).update(unit)
    }
    return Http.respond(response, 'Updated')
  }

  /**
   *
   * @param request
   * @param response
   * @param params
   */
  public async updateUnit({ request, response, params }: HttpContextContract) {
    const payload = await request.validate(UpdateUnitValidator)
    await Unit.query().where('id', params.id).update(payload)
    return Http.respond(response, 'Updated')
  }

  /**
   *
   * @param request
   * @param response
   */
  public async deleteUnit({ request, response }: HttpContextContract) {
    const payload = await request.validate(RequireIDValidator)
    await Unit.query().where('id', payload.id).delete()
    return Http.respond(response, 'Deleted')
  }
}
