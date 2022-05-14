import { BaseTask } from 'adonis5-scheduler/build'
import Course from 'App/Models/Course'
import { DateTime } from 'luxon'

export default class ExpireCourse extends BaseTask {
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
    await Course.query().where('expiry_date', '<', DateTime.now().toISO()).update('expired', true)
  }
}
