// const fs = require("fs"); // Import the file system module to read/write files
const e = require("express");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync"); 
const AppError = require("./../utils/appError");

exports.aliasTopTours = (req, res, next) => {
  // Define middleware function to alias top tours
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXQUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND THE RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id); // Find the tour by ID
    // Tour.findOne({ _id: req.params.id }) // Alternative way to find by ID
    if (!tour) {
      return next (new AppError("No tour found with that ID", 404)); // Handle case where tour is not found
    }
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const newTour = await Tour.create(req.body); // Create and save the new tour in one step

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }); // Update the tour with the given ID

    if (!tour) {
      return next (new AppError("No tour found with that ID", 404)); // Handle case where tour is not found
    }

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id); // Delete the tour with the given ID

    if (!tour) {
      return next (new AppError("No tour found with that ID", 404)); // Handle case where tour is not found
    }
    
    res.status(204).json({
      status: "success",
      data: null,
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 }, // Sort by average price in ascending order
      },
      // { $match: { _id: { $ne: "EASY" } } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // e.g., 2021
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        }
      },
      { 
        $addFields: { month: "$_id" } 
      },
      {
        $project: {
          _id: 0,
        }
      },
      { 
        $sort: { numTourStarts: -1 } 
      },
      { 
          $limit: 12 
        }

    ]);
    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
});
