export default class ControllersUtils {
  public static applySearchOnQuery(query, columns, searchString) {
    if (searchString) {
      query.where((innerQuery) => {
        columns.forEach((column) => innerQuery.orWhere(column, 'ilike', `%${searchString}%`))
      })
      return query
    }
  }

  public static applyFromOnQuery(query, from, dateField = 'created_at') {
    if (from) return query.whereRaw(`${dateField} >= '${from.toString()}'`)
  }

  public static applyToOnQuery(query, to, dateField = 'created_at') {
    if (to) return query.whereRaw(`${dateField} <= '${to.plus({ days: 1 }).toString()}'`)
  }

  public static applySortByOnQuery(query, sortBy, tablename = undefined) {
    // direction ternary operator for type checking
    if (sortBy) {
      return query.orderBy(sortBy.field, sortBy.direction === 'asc' ? 'asc' : 'desc')
    }
    return query.orderBy(tablename ? tablename + '.created_at' : 'created_at', 'desc')
  }

  public static applyFiltersOnQuery(query, filters) {
    if (filters) filters.forEach((filter) => query.where(filter))
    return query
  }

  /**
   * apply all query operations: search, filters, sorting, from and to date where clauses on the created_at column
   */
  public static applyAllQueryUtils(query, from, to, filters, sortBy, columns, searchString, tableName: any = undefined) {
    this.applyFiltersOnQuery(query, filters)
    this.applySearchOnQuery(query, columns, searchString)
    if (tableName) {
      this.applyFromOnQuery(query, from, `${tableName + '.created_at'}`)
      this.applyToOnQuery(query, to, `${tableName + '.created_at'}`)
    } else {
      this.applyFromOnQuery(query, from)
      this.applyToOnQuery(query, to)
    }
    this.applySortByOnQuery(query, sortBy, tableName)
    return query
  }
}
