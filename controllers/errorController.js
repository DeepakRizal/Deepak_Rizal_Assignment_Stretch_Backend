import AppError from "../utils/appError.js";

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}:${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateKeyError = (err) => {
  const { name } = err.keyValue;
  const msg = `Duplicate  field error please change (${name}) into another name`;
  return new AppError(msg, 400);
};

const handleValidationErrorDB = (err) => {
  const msg = Object.values(err.errors)
    .map((object) => `${object.message}.  `)
    .join("");

  return new AppError(msg, 400);
};

const handleJwtError = () =>
  new AppError("Invalid token. Please log in again", 401);

const handleJwtExpireError = () =>
  new AppError("Token has Expired!. Please log in again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === "CastError") error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateKeyError(error);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpireError();
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
