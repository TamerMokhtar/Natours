const fs = require("fs");
const express = require("express");
const morgan = require("morgan"); // Import morgan for logging HTTP requests

const AppError = require("./utils/appError"); // Import custom AppError class
const globalErrorHandler = require("./controllers/errorController"); // Import global error handling middleware
const tourRouter = require("./routes/tourRoutes"); // Import tour routes
const userRouter = require("./routes/userRoutes"); // Import user routes

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Use morgan to log requests in 'dev' format
}

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static(`${__dirname}/public`)); // Serve static files from the 'public' directory

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // Call the next middleware in the stack
});

// 2) ROUTES HNDLERS

// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

// 3) ROUTES  "Mouting the routers to the app"

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // Pass the error to the global error handling middleware
}); 

app.use(globalErrorHandler); // Use the global error handling middleware

// 4) START SERVER

module.exports = app; // Export the app for use in other files
