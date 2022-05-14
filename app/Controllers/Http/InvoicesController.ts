import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import Invoice from 'App/Models/Invoice'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import InvoiceGetValidator from 'App/Validators/InvoiceValidators/InvoiceGetValidator'
import InvoiceUpdateStatusValidator from 'App/Validators/InvoiceValidators/InvoiceUpdateStatusValidator'
import Admin from 'App/Models/Admin'
import User from 'App/Models/User'
import Http from 'App/Utils/Http'
import DataFilter from 'App/Utils/Filters'
import Transaction from '../../Models/Transaction'
import Database from '@ioc:Adonis/Lucid/Database'
import Utils from 'App/Utils/Utils'

export default class InvoicesController {
  public async invoices({ request, response }: HttpContextContract) {
    const { page, perPage, from, to, filters, sortBy, query, export: export_ } = await request.validate(GeneralAllValidator)
    let invoicesQuery = Database.from('invoices')
      .select(
        'invoices.id',
        'users.email',
        'users.username',
        'invoices.invoice_ref',
        'invoices.total_price',
        'invoices.type',
        'invoices.status',
        'invoices.price',
        'invoices.tax',
        'transactions.transaction_ref',
        'transactions.provider',
        'transactions.provider_ref',
        'transactions.method',
        'transactions.expiry_date'
      )
      .leftJoin('transactions', 'invoices.transaction_id', 'transactions.id')
      .leftJoin('users', 'invoices.user_id', 'users.id')
    const searchColumns = [
      'invoices.invoice_ref',
      'invoices.type',
      'invoices.status',
      'transactions.transaction_ref',
      'transactions.provider',
      'transactions.provider',
      'transactions.provider_ref',
      'transactions.method',
      'users.email',
      'users.username',
    ]
    if (sortBy) {
      sortBy.field = sortBy.field === 'created_at' ? 'invoices.' + sortBy.field : sortBy.field
    }
    ControllersUtils.applyAllQueryUtils(invoicesQuery, from, to, filters, sortBy, searchColumns, query, 'invoices')
    if (export_) {
      let result = Database.from('invoices')
        .leftJoin('transactions', 'invoices.transaction_id', 'transactions.id')
        .leftJoin('users', 'invoices.user_id', 'users.id')
        .select([
          'invoice_ref',
          'total_price',
          'price',
          'tax',
          'type',
          'invoices.status',
          'transactions.provider',
          'transactions.method',
          'transactions.created_at',
          'transactions.updated_at',
        ])
      if (!sortBy) {
        result.orderBy('created_at', 'desc')
      }
      ControllersUtils.applyAllQueryUtils(result, from, to, filters, sortBy, searchColumns, query, 'invoices')
      return Utils.exportCsv(response, [], await result.exec(), `invoices ${new Date().toString()}`)
    }
    const invoices = await invoicesQuery.paginate(page, perPage)
    const filterData = await this.fetchInvoiceFilters()
    return Http.respond(response, 'invoices', invoices.toJSON().data, invoices.toJSON().meta, filterData)
  }

  public async fetchInvoiceFilters() {
    const invoiceFilters = new DataFilter({
      model: Invoice,
      filterObjects: [
        {
          name: 'status',
          value: 'invoices.status',
          optionNameColumn: 'status',
          optionValueColumn: 'status',
        },
        {
          name: 'type',
          value: 'type',
          optionNameColumn: 'type',
          optionValueColumn: 'type',
        },
      ],
    }).process()
    const transactionFilters = new DataFilter({
      model: Transaction,
      filterObjects: [
        {
          name: 'method',
          value: 'method',
          optionNameColumn: 'method',
          optionValueColumn: 'method',
        },
        {
          name: 'provider',
          value: 'provider',
          optionNameColumn: 'provider',
          optionValueColumn: 'provider',
        },
      ],
    }).process()

    const filters = await Promise.all([invoiceFilters, transactionFilters])
    let transactionFiltersWithoutNull = filters[1].map((transaction) => {
      if (transaction.name === 'Provider') {
        return {
          ...transaction,
          options: transaction.options.filter((val) => val.value !== null),
        }
      }
      return transaction
    })

    return [...filters[0], ...transactionFiltersWithoutNull]
  }

  public async invoice({ request, response }: HttpContextContract) {
    const { id } = await request.validate(InvoiceGetValidator)
    const invoice = await Invoice.query()
      .preload('transaction')
      .preload('student', (studentQuery) => studentQuery.preload('user'))
      .preload('courses', (coursesQuery) => coursesQuery.preload('classroom'))
      .where('id', id)
      .firstOrFail()
    return Http.respond(response, 'invoices', invoice)
  }

  public async updateInvoiceStatus({ request, response, auth }: HttpContextContract) {
    const { id, status } = await request.validate(InvoiceUpdateStatusValidator)
    const invoice = await Invoice.query().where('id', id).firstOrFail()
    await invoice.merge({ status }).save()
    await Admin.logAction(auth.id, 'update invoice', 'update_invoice', `Updated Invoice status from ${status} to ${invoice.status}`)
    return Http.respond(response, 'invoice', invoice)
  }

  public async processInvoice({ request, auth }: HttpContextContract) {
    const { id } = await request.validate(InvoiceGetValidator) // same as get single invoice validator
    const invoice = await Invoice.query().preload('transaction').where('id', id).firstOrFail()
    const transaction = await invoice.transaction
    const { wallet } = await User.getStudentBasicInfo('id', invoice.user_id)
    await wallet.merge({ amount: wallet.amount + invoice.price }).save()
    await wallet.save()
    await transaction.merge({ status: 'paid' }).save()
    await invoice.save()
    await Admin.logAction(auth.id, 'process transaction', 'process_transaction', `Process transaction ${invoice.invoice_ref}`)
    return { message: 'transaction processed' }
  }
}
