/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error handler middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * General error handling middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error Details:', {
    name: err.name,
    message: err.message,
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Create error response
  const errorResponse = {
    error: {
      message: err.message || 'Something went wrong',
      statusCode,
      type: err.name || 'ServerError',
      path: req.originalUrl
    }
  };
  
  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Database error handler
 * @param {Error} err - Database error
 * @param {string} operation - Operation being performed
 */
const handleDatabaseError = (err, operation) => {
  console.error(`Database Error during ${operation}:`, err);
  
  // Convert SQLite error codes to appropriate HTTP status codes and messages
  let statusCode = 500;
  let message = 'Database error occurred';
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409; // Conflict
    message = 'Constraint violation in database operation';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503; // Service Unavailable
    message = 'Database is busy, please try again later';
  } else if (err.code === 'SQLITE_READONLY') {
    statusCode = 500;
    message = 'Database is in read-only mode';
  } else if (err.code === 'SQLITE_NOTFOUND') {
    statusCode = 404;
    message = 'Requested resource not found in database';
  }
  
  throw new APIError(message, statusCode);
};

module.exports = {
  APIError,
  notFoundHandler,
  errorHandler,
  handleDatabaseError
}; 