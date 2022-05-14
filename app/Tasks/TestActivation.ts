import { BaseTask } from 'adonis5-scheduler/build'
import Test from 'App/Models/Test'
import { DateTime } from 'luxon'

export default class TestActivation extends BaseTask {
  public static get schedule() {
    return '0 */30 * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    await Test.query().where('activeStartDate', '<=', DateTime.now().toISO()).update('active', true)
    await Test.query().where('activeEndDate', '<=', DateTime.now().toISO()).update('active', false)
  }
}
