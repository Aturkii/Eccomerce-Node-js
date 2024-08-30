export class apiFeatures {

  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery
    this.queryString = queryString


  }
  pagination() {
    let page = this.queryString.page * 1 || 1
    if (page < 1) page = 1
    let limit = 3
    let skip = (page - 1) * limit
    this.mongooseQuery.skip(skip).limit(limit)
    return this
  }


  filter() {

    let queryOp = ["page", "select", "sort", "search"]
    let filterQuery = { ...this.queryString }
    queryOp.forEach((e) => {
      delete filterQuery[e]
    })
    filterQuery = JSON.parse(JSON.stringify(filterQuery).replace(/(gt|lt|gte|lte|eq)/, (match) => `$${match}`))

    this.mongooseQuery.find(filterQuery)
    return this

  }
  sort() {
    if (this.queryString.sort) {
      this.mongooseQuery.sort(this.queryString.sort.replaceAll(",", " "))
    }
    return this
  }

  select() {
    if (this.queryString.select) {
      this.mongooseQuery.select(this.queryString.select.replaceAll(",", " "))
    }
    return this
  }

  search() {
    if (this.queryString.search) {

      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryString.search, $options: "i" } },
          { description: { $regex: this.queryString.search, $options: "i" } }
        ]
      })
    }
    return this

  }
}