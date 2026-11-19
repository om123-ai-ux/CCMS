const config = require('../config/env');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'A record with this information already exists.', 409);
  }

  if (err.code === 'ECONNREFUSED') {
    console.error('[CCMS Database Error]:', err.message);
    return errorResponse(res, 'Database connection refused. Please ensure MySQL is running.', 503);
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds 5MB limit.', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // Custom operational error status or default 500
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('[CCMS Error Handler]:', err);
  }

  const message = config.isProduction && statusCode >= 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
