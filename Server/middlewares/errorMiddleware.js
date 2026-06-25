const ApiError = require("../utils/ApiError");

const sendToDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
  });
};

const sendToProd = (err, res) => {
  let error = err;

  // JWT errors handling
  if (err.name === "JsonWebTokenError") {
    error = new ApiError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError("Token expired", 401);
  }

  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
  });
};

const globalError = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return sendToDev(err, res);
  }

  return sendToProd(err, res);
};

module.exports = globalError;