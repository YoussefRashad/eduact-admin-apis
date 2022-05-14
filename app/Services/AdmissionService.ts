import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import Classroom from '../Models/Classroom'
import AdmissionForm from '../Models/AdmissionForm'

export default class AdmissionService {
  public static async getAdmissionForm(classroom_id) {
    // returns classroom's form with questions based on the classroom id
    const classroom = await Classroom.find(classroom_id)
    if (!classroom) throw new ResourceNotFoundException('Classroom not found')
    return AdmissionForm.query()
      .preload('questions', (query) => {
        query.orderBy('order')
      })
      .where('id', classroom.admission_form_id)
      .where('active', true)
      .first()
  }

  public static async findBy(key, value) {
    return AdmissionForm.query().where(key, value).preload('questions').first()
  }

  public static async findByOrFail(key, value) {
    const response = await AdmissionForm.query()
      .where(key, value)
      .preload('questions')
      .preload('classroom', (classroomQuery) => {
        classroomQuery.preload('students')
      })
      .first()
    if (!response) {
      throw new ResourceNotFoundException('admission form not found')
    }
    return response
  }
}
