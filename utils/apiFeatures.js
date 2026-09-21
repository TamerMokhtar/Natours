class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const qureryObj = { ...this.queryString }; // Create a copy of the query parameters
    const excludedFields = ["page", "sort", "limit", "fields"]; // Fields to exclude from the query
    excludedFields.forEach((el) => delete qureryObj[el]); // Remove excluded fields from the query object
    let queryStr = JSON.stringify(qureryObj); // Convert the query object to a JSON string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);// Replace comparison operators with MongoDB operators (e.g., gte -> $gte)

    this.query = this.query.find(JSON.parse(queryStr)); // Retrieve all tours from the database based on the query object
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" "); // Convert comma-separated sort fields to space-separated
      this.query = this.query.sort(sortBy); // Sort the query results
    } else {
      this.query = this.query.sort("-createdAt"); // Default sort by createdAt in descending order
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" "); // Convert comma-separated fields to space-separated
      this.query = this.query.select(fields); // Limit the fields returned in the query results
    } else {
      this.query = this.query.select("-__v"); // Exclude the __v field by default from the query results in Mongoose and MongoDB and version key in postman
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // Get the page number from the query parameters, default to 1 if not specified
    const limit = this.queryString.limit * 1 || 100; // Get the limit from the query parameters, default to 100
    const skip = (page - 1) * limit; // Calculate the number of documents to skip based on the page and limit
    this.query = this.query.skip(skip).limit(limit); // Apply pagination to the query
    return this;
  }
}
module.exports = APIFeatures;
