/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Event from '@ioc:Adonis/Core/Event'
import ImportService from 'App/Services/ImportService'
import User from 'App/Models/User'
import Classroom from 'App/Models/Classroom'
import EnrollClassroom from 'App/Models/EnrollClassroom'
import Course from 'App/Models/Course'
import EnrollCourse from 'App/Models/EnrollCourse'

Event.on('import:ban', async (data) => {
  const importService = new ImportService()
  const importRow = await importService.newImport('ban/unban students import', data.bannedStudents)
  let failed: Array<any> = []
  for await (const bannedStudent of data.bannedStudents) {
    if (bannedStudent.flag.toLowerCase() !== 'true' && bannedStudent.flag.toLowerCase() !== 'false') {
      importService.pushFailed(failed, bannedStudent.username, bannedStudent.id, 'Unrecognized flag (true or false)')
      continue
    }
    const user: any = await User.findBy('username', bannedStudent.username)
    const classroom: any = await Classroom.findBy('id', bannedStudent.id)
    await EnrollClassroom.query().where('user_id', user?.id).where('classroom_id', classroom.id).update('active', bannedStudent.flag.toLowerCase())
  }
  await importService.updateImport(importRow.id, {
    failedData: JSON.stringify(failed),
    failedCount: failed.length,
    status: 'success',
  })
})

Event.on('import:enrollCourses', async (data) => {
  const importService = new ImportService()
  const importRow = await importService.newImport('enroll students in course import', data.studentCourses)
  let failed: Array<any> = []
  for await (const studentCourse of data.studentCourses) {
    if (studentCourse.flag.toLowerCase() !== 'true' && studentCourse.flag.toLowerCase() !== 'false') {
      importService.pushFailed(failed, studentCourse.username, studentCourse.id, 'Unrecognized flag (true or false)')
      continue
    }
    const user: any = await User.findBy('username', studentCourse.username)
    if (!user) {
      failed.push({
        user_id: studentCourse.username,
        classroom_id: studentCourse.id,
        reason: 'User not found',
      })
      continue
    }
    const course: any = await Course.findBy('id', studentCourse.id)
    if (!course) {
      importService.pushFailed(failed, studentCourse.username, studentCourse.id, 'Course not found')
      continue
    }
    if (course.expired) {
      importService.pushFailed(failed, studentCourse.username, studentCourse.id, 'Course is expired')
      continue
    }
    try {
      if (JSON.parse(studentCourse.flag.toLowerCase())) {
        const now = new Date()
        await user.related('courses').attach({
          [course.id]: {
            purchase_method: 'admin',
            expired: false,
            expire_at: course.expiry_period ? new Date(now.setDate(now.getDate() + course.expiry_period)) : null,
          },
        })
      } else {
        await EnrollCourse.query().where('user_id', user.id).where('course_id', course.id).delete()
      }
    } catch (error) {
      importService.pushFailed(failed, user.username, course.id, error.detail)
    }
  }
  await importService.updateImport(importRow.id, {
    failedData: JSON.stringify(failed),
    failedCount: failed.length,
    status: 'success',
  })
})

Event.on('import:enrollClassrooms', async (data) => {
  const importService = new ImportService()
  const importRow = await importService.newImport('enroll students in classroom import', data.studentClassrooms)
  let failed: Array<any> = []
  for await (const studentClassroom of data.studentClassrooms) {
    if (studentClassroom.flag.toLowerCase() !== 'true' && studentClassroom.flag.toLowerCase() !== 'false') {
      importService.pushFailed(failed, studentClassroom.username, studentClassroom.id, 'Unrecognized flag (true or false)')
      continue
    }
    const user: any = await User.findBy('username', studentClassroom.username)
    if (!user) {
      importService.pushFailed(failed, studentClassroom.username, studentClassroom.id, 'User not found')
      continue
    }
    const classroom: any = await Classroom.findBy('id', studentClassroom.id)
    if (!classroom) {
      importService.pushFailed(failed, studentClassroom.username, studentClassroom.id, 'Classroom not found')
      continue
    }
    try {
      if (JSON.parse(studentClassroom.flag.toLowerCase())) {
        await EnrollClassroom.create({
          user_id: user.id,
          classroom_id: classroom.id,
          active: true,
        })
      } else {
        await EnrollClassroom.query().where('user_id', user.id).where('classroom_id', classroom.id).delete()
      }
    } catch (error) {
      importService.pushFailed(failed, user.username, classroom.id, error.detail)
    }
  }
  await importService.updateImport(importRow.id, {
    failedData: JSON.stringify(failed),
    failedCount: failed.length,
    status: 'success',
  })
})
