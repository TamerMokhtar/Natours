const AppError = require("./../utils/appError");

const handleCastErrorDB = err => { // Handle invalid database cast errors 
  const message = `Invalid ${err.path}: ${err.value}.`; // Create a message for the invalid field and value
  return new AppError(message, 400); // Return a new AppError instance with the message and status code / just like this we transform the wired error that we were getting from the database Mongoose into a more user-friendly error that we can send to the client
};

const handleDuplicateFieldsDB = err => { // Handle duplicate field errors in the database
  const value = Object.values(err.keyValue)[0]; // keyValue holds the duplicated field/value pair directly (err.errmsg no longer exists on MongoDB driver 6+)

  const message = `Duplicate field value: ${value}. Please use another value!`; // Create a message for the duplicate field value
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => { 
  const errors = Object.values(err.errors).map(el => el.message); // Extract the error messages from the validation errors
  
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
}
                
const sendErrorDev = (err, res) => {
     res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
   if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  }else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack); 
   err.statusCode = err.statusCode || 500;
   err.status = err.status || "error";
  
   if(process.env.NODE_ENV === "development") {
      sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message }; // Create a copy of the error object to avoid mutating the original error  / use destructuring of the original error object to create a new error object with the same properties / explicitly copy name and message since they're non-enumerable on Error instances and get lost in the spread

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
      sendErrorProd(error, res);
  }
};