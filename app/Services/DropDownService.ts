import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Category from 'App/Models/Category'
import Classroom from 'App/Models/Classroom'
import Course from 'App/Models/Course'
import Section from 'App/Models/Section'
import Unit from 'App/Models/Unit'

export default class DropDownService {
  public static async instructors() {
    return User.query().select(['id', 'first_name', 'last_name']).has('instructor').exec()
  }

  public static async categories() {
    return Category.query().select(['id', 'name']).exec()
  }

  public static async classrooms() {
    return Classroom.query()
      .select(['id', 'title', 'label'])
      .preload('courses', (query) => {
        query.preload('units', (query) => {
          query.whereHas('unitType', (query) => {
            query.where('name', 'test')
          })
        })
      })
      .exec()
  }

  public static async courses(classroomId) {
    return Course.query().select(['id', 'name', 'code']).where('classroom_id', classroomId).exec()
  }

  public static async units(courseId) {
    return Unit.query().where('course_id', courseId).exec()
  }

  public static sections(classroomId) {
    return Section.query()
      .whereHas('classroomTab', (query) => {
        query.where('classroom_id', classroomId)
      })
      .preload('classroomTab')
  }

  public static async batches() {
    return Database.from('scratchcards').select('batch').orderBy('batch', 'asc').distinct()
  }

  public static async rechargeCardsBatches() {
    return Database.from('recharge_cards').select('batch').orderBy('batch', 'asc').distinct()
  }

  // gets classroom courses with prerequisites
  public static async prerequisites(classroomId: number) {
    return Course.query()
      .where('classroom_id', classroomId)
      .select(['id', 'name'])
      .preload('course_prerequisites', (pivotPreloader) => {
        pivotPreloader.preload('prerequisite_course')
      })
  }
}
