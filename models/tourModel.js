const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less or equal than 40 characters"],
    minlength: [10, "A tour name must have more or equal than 10 characters"],
    // validate: [validator.isAlpha, "Tour name must only contain characters"],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either: easy, medium, difficult",
    },
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: {  
    type: Number,
    validate: {
      // This only points to the current document on NEW document creation
      validator: function (val) {
        return val < this.price;  // 250 < 200
      },
      message: "Discount price ({VALUE}) should be below regular price"
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  }
},
  {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; // Calculate duration in weeks
});

// Document Middleware: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); // Generate a slug from the tour name
  next(); // Proceed to the next middleware or save operation
}); 

// tourSchema.pre("save", function (next) {
//   console.log("Will save document...");
//   next(); // Proceed to the next middleware or save operation
// });

// tourSchema.post("save", function (doc, next) {
//   console.log(doc); // Log the saved document after it has been saved
//   next(); // Proceed to the next middleware or operation
// });

// Query Middleware: runs before and after queries
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // Exclude secret tours from query results
  this.start = Date.now(); // Record the start time of the query
  next(); // Proceed to the next middleware or query operation
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`); // Log the time taken for the query
  console.log(docs); // Log the documents returned by the query
  next(); // Proceed to the next middleware or operation
} );

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // Exclude secret tours from aggregation results
  console.log(this.pipeline()); //
  next(); // Proceed to the next middleware or aggregation operation
});

const Tour = mongoose.model("Tour", tourSchema); // Create a model named "Tour" using the defined schema

module.exports = Tour; // Export the Tour model for use in other parts of the application
