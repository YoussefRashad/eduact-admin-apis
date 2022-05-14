import { BaseTask } from 'adonis5-scheduler/build'
import Course from 'App/Models/Course'
import { DateTime } from 'luxon'

export default class ActiveBuyCourse extends BaseTask {
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
    // Work on active flag
    await Course.query()
      .where('active_start_date', '<', DateTime.now().toISO())
      .orWhere((query) => {
        query.whereNull('active_start_date').where('active_end_date', '>', DateTime.now().toISO())
      })
      .update('active', true)
    await Course.query().where('active_end_date', '<', DateTime.now().toISO()).update('active', false)
    // Work on buyable flag
    await Course.query()
      .where('buy_start_date', '<', DateTime.now().toISO())
      .orWhere((query) => {
        query.whereNull('buy_start_date').where('buy_end_date', '>', DateTime.now().toISO())
      })
      .update('buyable', true)
    await Course.query().where('buy_end_date', '<', DateTime.now().toISO()).update('buyable', false)
  }
}
