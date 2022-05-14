import UnitType from 'App/Models/UnitType'
import Unit from '../Models/Unit'

export default class UnitService {
  /**
   *
   * @param unit
   * @returns
   */
  public async createUnit(unit: Partial<UnitType>) {
    return Unit.create(unit)
  }
  /**
   *
   * @param unit_id
   * @param data
   * @returns
   */
  public async updateUnit(unit_id: number, data: any) {
    return Unit.query().where('id', unit_id).update(data)
  }
}
