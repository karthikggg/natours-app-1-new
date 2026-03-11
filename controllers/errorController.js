const AppError = require('../utils/appError');

const castErrorHandlerDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};
const duplicateFieldHandlerDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value : ${value} . Please use another value! with error code of ${err.code}`;
  return new AppError(message, 400);
};
const validationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};
const handleInvalidTokenError = (err) => {
  return new AppError(`token is invalid`, 401, err);
};
const handleEpiredToken = (err) => {
  return new AppError(`token expireds`, 401, err);
};
const devErr = (err, req, res, next) => {
  // A. api page error
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      message: err.message,
      errStatusCode: err.statusCode,
      status: err.status,
      metaData: err.metaData || null,
      errStack: err.stack,
      isOperational: err.isOperational,
      err: err,
    });
  }
  // B. render page error
  res.status(200).render('errorPage', {
    message: err,
    title: 'something went wrong',
  });
};

const productionError = (err, req, res, next) => {
  //Operational , trusted error : send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        message: err.message,
        err: err,
        status: err.status,
      });
    } else {
      //Programming or other unknown error : don't leak error details
      console.error('ERROR 💥', err);
      return res.status(500).json({
        status: 'error',
        message: `Something went very wrong! : ${err.message}`,
        err: err,
        isOperational: err.isOperational,
      });
    }
  }
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('errorPage', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('errorPage', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};
module.exports = (err, req, res, next) => {
  console.log(
    '==============error======================' +
      err +
      '==============error======================',
  );
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    devErr(err, req, res, next);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') err = castErrorHandlerDB(error);
    if (err.code === 11000) err = duplicateFieldHandlerDB(error);
    if (err.name === 'ValidationError') err = validationErrorDB(error);
    if (err.name === 'JsonWebTokenError') err = handleInvalidTokenError(error);
    if (err.name === 'TokenExpiredError') err = handleEpiredToken(error);
    productionError(err, req, res, next);
  }

  next();
};
