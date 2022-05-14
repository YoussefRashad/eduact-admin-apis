import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Admin from 'App/Models/Admin'
import RechargeCard from 'App/Models/RechargeCard'
import DataFilter from 'App/Utils/Filters'
import Http from 'App/Utils/Http'
import Utils from 'App/Utils/Utils'
import RechargeCardBatchNumberValidator from 'App/Validators/RechargeCardsValidator/RechargeCardBatchNumberValidator'
import RechargeCardDeleteValidator from 'App/Validators/RechargeCardsValidator/RechargeCardDeleteValidator'
import RechargeCardGenerateValidator from 'App/Validators/RechargeCardsValidator/RechargeCardGenerateValidator'
import RechargeCardGetAllValidator from 'App/Validators/RechargeCardsValidator/RechargeCardGetAllValidator'
import ControllersUtils from './ControllersUtils'
import CustomException from '../../Exceptions/CustomException'

export default class RechargeCardsController {
  public async rechargeCards({ request, response }: HttpContextContract) {
    const { page, perPage, from, to, filters, sortBy, query, export: export_ } = await request.validate(RechargeCardGetAllValidator)
    const rechargeCardsQuery = Database.from('recharge_cards')
      .select(
        'recharge_cards.id',
        'recharge_cards.code',
        'users.email',
        'recharge_cards.value',
        'recharge_cards.user_id',
        'recharge_cards.batch',
        'recharge_cards.created_at',
        'recharge_cards.updated_at'
      )
      .leftJoin('users', 'recharge_cards.user_id', 'users.id')
    const searchColumns = ['recharge_cards.code', 'users.email', 'users.username']
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'recharge_cards.' + sortBy.field : sortBy.field
    }
    if (filters) {
      filters.forEach((filter) => {
        if (filter['used'] === true) {
          rechargeCardsQuery.select('recharge_cards.user_id').whereNotNull('recharge_cards.user_id')
          delete filter.used
        } else if (filter['used'] === false) {
          rechargeCardsQuery.select('recharge_cards.user_id').whereNull('recharge_cards.user_id')
          delete filter.used
        }
      })
    }
    ControllersUtils.applyAllQueryUtils(rechargeCardsQuery, from, to, filters, sortBy, searchColumns, query, 'recharge_cards')
    if (export_) {
      const result = await rechargeCardsQuery.exec()
      return Utils.exportCsv(
        response,
        ['Code', 'email', 'Batch', 'value', 'Created At', 'used', 'Used At'],
        result.map((row: any) => {
          const newRow: any = {}
          newRow.code = row.code
          newRow.email = row.email
          newRow.batch = row.batch
          newRow.value = row.value
          newRow['created_at'] = row.created_at
          newRow['used'] = row.user_id ? true : false
          newRow['used at'] = row.user_id ? row.updated_at : ''
          return newRow
        }, `recharge cards ${new Date().toString()}`)
      )
    }
    const rechargeCards = (await rechargeCardsQuery.paginate(page, perPage)).toJSON()
    const filterData = await this.fetchRechargeCardsFilters()
    return Http.respond(
      response,
      'recharge_cards',
      rechargeCards.data,
      {
        ...rechargeCards.meta,
      },
      filterData
    )
  }

  public async fetchRechargeCardsFilters() {
    const filters = await new DataFilter({
      model: RechargeCard,
      filterObjects: [
        {
          name: 'Batch',
          value: 'batch',
          optionNameColumn: 'batch',
          optionValueColumn: 'batch',
        },
        {
          name: 'Value',
          value: 'value',
          optionNameColumn: 'value',
          optionValueColumn: 'value',
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

  public async generateRechargeCard({ request, response, auth }: HttpContextContract) {
    const { quantity, value } = await request.validate(RechargeCardGenerateValidator)
    if (quantity < 1) {
      throw new CustomException('quantity must be bigger than 0')
    }
    if (value < 1) {
      throw new CustomException('value must be bigger than 0')
    }
    let list: Array<any> = []
    let nameList: Array<any> = []
    let maxBatch = await Database.from('recharge_cards').max('batch')
    maxBatch = maxBatch[0].max ? maxBatch[0].max + 1 : 1
    for (let step = 0; step < quantity; step++) {
      const code = Utils.generateMixedCaseToken(10)
      list.push({
        code,
        value,
        created_at: Utils.now(),
        updated_at: Utils.now(),
        batch: maxBatch,
      })
      nameList.push({
        code,
        batch: maxBatch,
        value,
        created_at: Utils.now(),
        updated_at: Utils.now(),
      })
    }
    await RechargeCard.createMany(list)
    return Utils.exportCsv(response, ['Code', 'Batch', 'value', 'Created At', 'Used At'], nameList)
  }

  public async deleteRechargeCards({ request, response, auth }: HttpContextContract) {
    const { id } = await request.validate(RechargeCardDeleteValidator)
    const rechargeCards = await RechargeCard.query().where('id', id).firstOrFail()
    await rechargeCards.delete()
    return Http.respond(response, 'recharge cards', rechargeCards)
  }

  public async deleteByBatch({ request, response, auth }: HttpContextContract) {
    const { batch_number } = await request.validate(RechargeCardBatchNumberValidator)
    await RechargeCard.query().where('batch', batch_number).delete()
    return Http.respond(response, `batch ${batch_number} recharge cards deleted`)
  }
}
