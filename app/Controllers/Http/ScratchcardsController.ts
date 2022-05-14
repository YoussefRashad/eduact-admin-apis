import Instructor from 'App/Models/Instructor'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Scratchcard from 'App/Models/Scratchcard'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import ScratchcardDeleteValidator from 'App/Validators/ScratchcardValidators/ScratchcardDeleteValidator'
import Admin from 'App/Models/Admin'
import ScratchcardGenerateValidator from 'App/Validators/ScratchcardValidators/ScratchcardGenerateValidator'
import Classroom from 'App/Models/Classroom'
import Course from 'App/Models/Course'
import Utils from 'App/Utils/Utils'
import Database from '@ioc:Adonis/Lucid/Database'
import ScratchcardGetAllValidator from 'App/Validators/ScratchcardValidators/ScratchcardGetAllValidator'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import ScratchcardBatchNumberValidator from 'App/Validators/ScratchcardValidators/ScratchcardBatchNumberValidator'
import CustomException from 'App/Exceptions/CustomException'

export default class ScratchcardsController {
  public async scratchcards({ request, response }: HttpContextContract) {
    const { page, perPage, from, to, filters, sortBy, query, export: export_ } = await request.validate(ScratchcardGetAllValidator)
    const scratchCardsQuery = Database.from('scratchcards')
      .select(
        'scratchcards.id',
        'scratchcards.code',
        'classrooms.title',
        'classrooms.label',
        'courses.name',
        'scratchcards.user_id',
        'users.email',
        'instructors.label',
        'scratchcards.batch',
        'scratchcards.created_at',
        'scratchcards.updated_at'
      )
      .leftJoin('classrooms', 'scratchcards.classroom_id', 'classrooms.id')
      .leftJoin('users', 'scratchcards.user_id', 'users.id')
      .leftJoin('courses', 'scratchcards.course_id', 'courses.id')
      .leftJoin('instructors', 'classrooms.instructor_id', 'instructors.user_id')
    const searchColumns = ['scratchcards.code', 'classrooms.title', 'courses.name', 'users.email', 'users.username']
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'scratchcards.' + sortBy.field : sortBy.field
    }
    if (filters) {
      filters.forEach((filter) => {
        if (filter['used'] === true) {
          scratchCardsQuery.select('scratchcards.user_id').whereNotNull('scratchcards.user_id')
          delete filter.used
        } else if (filter['used'] === false) {
          scratchCardsQuery.select('scratchcards.user_id').whereNull('scratchcards.user_id')
          delete filter.used
        }
      })
    }
    ControllersUtils.applyAllQueryUtils(scratchCardsQuery, from, to, filters, sortBy, searchColumns, query, 'scratchcards')
    if (export_) {
      const result = await scratchCardsQuery.exec()
      return Utils.exportCsv(
        response,
        ['Code', 'Classroom', 'classroom label', 'Course', 'instructor', 'email', 'Batch', 'Created At', 'Used At', 'used'],
        result.map((row: any) => {
          const newRow: any = {}
          newRow.code = row.code
          newRow.classroom = row.title
          newRow['classroom label'] = row.label
          newRow.course = row.name
          newRow.instructor = row.label
          newRow.email = row.email
          newRow.batch = row.batch
          newRow['created_at'] = row.created_at
          newRow['used at'] = row.user_id ? row.updated_at : ''
          newRow['used'] = row.user_id ? true : false
          return newRow
        }, `scratch cards ${new Date().toString()}`)
      )
    }
    const scratchCards = (await scratchCardsQuery.paginate(page, perPage)).toJSON()
    const filterData = await this.fetchScratchCardFilters()
    return Http.respond(
      response,
      'scratchcards',
      scratchCards.data,
      {
        ...scratchCards.meta,
      },
      filterData
    )
  }

  public async fetchScratchCardFilters() {
    const filters = await new DataFilter({
      model: Scratchcard,
      filterObjects: [
        {
          name: 'Batch',
          value: 'batch',
          optionNameColumn: 'batch',
          optionValueColumn: 'batch',
        },
      ],
    }).process()
    return filters.concat({
      name: 'Used',
      value: 'used',
      options: [
        {
          name: 'used',
          value: true,
        },
        {
          name: 'un_used',
          value: false,
        },
      ],
      type: 'dropdown',
    })
  }

  public async generateScratchCard({ request, response, auth }: HttpContextContract) {
    const { classroom_id, course_id, quantity, scheme } = await request.validate(ScratchcardGenerateValidator)
    if (quantity < 1) {
      throw new CustomException('quantity must be bigger than 0')
    }
    const classroom = await Classroom.query().where('id', classroom_id).preload('category').firstOrFail()
    const instructor = await Instructor.query().where('user_id', classroom.instructor_id).first()
    let course: Course | null = null
    if (course_id) {
      course = await Course.query().where('classroom_id', classroom_id).where('id', course_id).firstOrFail()
    }
    const category = classroom.category
    let list: Array<any> = []
    let nameList: Array<any> = []
    let maxBatch = await Database.from('scratchcards').max('batch')
    maxBatch = maxBatch[0].max ? maxBatch[0].max + 1 : 1
    // calculate the serial number of scratchcard
    const scratchcardClassroom = await Scratchcard.query().where('classroom_id', classroom_id).orderBy('id', 'desc').first()
    let serialNumber = 1
    if (scratchcardClassroom) {
      serialNumber += +scratchcardClassroom?.serial.split('-')[1]
    }
    const pad = '0000000'

    for (let step = 0; step < quantity; step++, serialNumber++) {
      const code = category.code + Utils.generateMixedCaseToken(9, scheme ? this.schemeMapper(scheme) : undefined)
      const serial = classroom.code + '-' + Utils.generateSerialScratchcard(pad, serialNumber)

      // to create the scratch cards
      list.push({
        code,
        serial,
        classroom_id: classroom.id,
        course_id: course ? course.id : null,
        created_at: Utils.now(),
        updated_at: Utils.now(),
        batch: maxBatch,
      })
      // nameList to export scratch cards in csv file
      nameList.push({
        code,
        serial,
        classroom: classroom.title,
        classroom_label: classroom.label,
        course: course ? course.name : null,
        instructor: instructor?.label,
        batch: maxBatch,
        created_at: Utils.now(),
        updated_at: Utils.now(),
      })
    }
    await Scratchcard.createMany(list)
    await Admin.logAction(
      auth.id,
      'generate scratchcards',
      'generate_scratchcards',
      `Generate Scratchcards fro classroom ${classroom.title} course ${course ? course.name : ''}`
    )
    return Utils.exportCsv(response, ['Code', 'Classroom', 'classroom label', 'Course', 'instructor', 'Batch', 'Created At', 'Used At'], nameList)
  }

  public schemeMapper(scheme: string) {
    const schemeMapper = {
      alphanumeric: 'abcdefghjkmnpqrstuwxyzABCDEFGHJKMNPQRSTUWXYZ123456789',
      numeric: '0123456789',
    }
    return schemeMapper[scheme]
  }

  public async deleteScratchcard({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(ScratchcardDeleteValidator)
    const scratchCard = await Scratchcard.query().where('id', id).firstOrFail()
    await scratchCard.delete()
    await Admin.logAction(auth.id, 'delete scratchcards', 'delete_scratchcards', `Delete scratchcard course ${scratchCard.code}`)
    return Http.respond(response, 'scratchcards', scratchCard)
  }

  public async deleteByBatch({ request, response, auth }: HttpContextContract) {
    const { batch_number } = await request.validate(ScratchcardBatchNumberValidator)
    await Scratchcard.query().where('batch', batch_number).delete()
    await Admin.logAction(
      auth.id,
      `delete scratchcards by batch number`,
      'delete_scratchcards_by_batch:_batch_number',
      `Delete scratch cards for batch: ${batch_number}`
    )
    return Http.respond(response, `batch ${batch_number} scratch cards deleted`)
  }
}
