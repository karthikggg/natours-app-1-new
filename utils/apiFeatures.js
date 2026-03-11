class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    let queryObj = { ...this.queryStr };

    let excludeQuery = ['page', 'sort', 'limit', 'fields'];
    excludeQuery.forEach((el) => delete queryObj[el]);

    //advance filter querry written here
    let qryString = JSON.stringify(queryObj);

    qryString = qryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    //executing querry
    this.query = this.query.find(JSON.parse(qryString));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort;
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-name');
    }
     return this;
  }
  field() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
     return this;
  }
  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
     return this;
  }
  
}
module.exports = ApiFeatures