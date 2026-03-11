class AppError extends Error {
  constructor(message, statusCode, metaData) {
    super(message);
    this.statusCode = 401;
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'success';
    this.isOperational = true; // Changed from 'true' to true
    this.metaData = metaData;
    Error.captureStackTrace(this, this.constructor);
  } 
}
module.exports = AppError;
