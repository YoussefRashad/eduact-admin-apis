export type Option = { name: string; value: string }
export type Filter = { name: string; value: string; options: Option[]; type: string }
export type FilterObject = {
  name: string
  value: string
  optionNameColumn: string
  optionValueColumn: any
  type: string
}
export default class DataFilter {
  Model: any
  filterNames: string[] = []
  filterValues: string[] = []
  filterObjects: FilterObject[]
  data: any = []
  options: Option[] = []
  filter: Filter
  value: string
  filters: Filter[] = []
  type: string

  constructor({ model, filterObjects, type = 'dropdown' }) {
    this.Model = model
    this.filterObjects = filterObjects
    this.type = type
  }

  public getFilterNames(): void {
    this.filterObjects.forEach((obj) => this.filterNames.push(obj.value))
  }

  public async getDistinctData(filterNames = this.filterNames): Promise<any> {
    const data = await this.Model.query()
      .distinctOn(...filterNames)
      .pojo()
    this.data = data
  }

  public setName(filterValue: string): void {
    this.filter = {
      name: filterValue.charAt(0).toUpperCase() + filterValue.slice(1),
      value: '',
      options: [],
      type: 'dropdown', // it is the default value
    }
  }

  public setValue(filterValue: string): void {
    this.filter.value = filterValue
  }

  public setType(filterType: string): void {
    this.filter.type = filterType
  }

  public setOptions(filterNameColumn: string, filterValueColumn: string, filter = this.filter) {
    this.data.map((obj) => {
      if (!this.options.some((option) => option.value === obj[filterValueColumn]))
        this.options.push({ name: String(obj[filterNameColumn]), value: obj[filterValueColumn] })
    })
    this.filter.options = this.options
    this.options = []
    return filter
  }

  public setOneFilter(filterName: string, filterValue: string, filterNameColumn: string, filterValueColumn: string, filterType: string) {
    this.setName(filterName)
    this.setValue(filterValue)
    this.setType(filterType)
    return this.setOptions(filterNameColumn, filterValueColumn)
  }

  public setManyFilters(filterObjects = this.filterObjects) {
    filterObjects.forEach((obj) => {
      const filter = this.setOneFilter(obj.name, obj.value, obj.optionNameColumn, obj.optionValueColumn, this.type)
      this.filters.push(filter)
    })
  }

  public parseFilters() {
    return this.filters
  }

  public async process(): Promise<any> {
    this.getFilterNames()
    await this.getDistinctData()
    this.setManyFilters(this.filterObjects)
    return this.parseFilters()
    // return this.modifyLegacy(parseFilter)
  }

  public async modifyLegacy(parseFilter) {
    return parseFilter.map((filter) => {
      const valueName = filter.value
      delete filter.name
      delete filter.value
      const newObject = {}
      delete Object.assign(newObject, filter, { [valueName]: filter['options'] })['options']
      return newObject
    })
  }
}
