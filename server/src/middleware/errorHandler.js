import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Global Error Handler Middleware
 * Centralized error handling with proper logging and client responses
 */

const errorHandler = (err, req, res, next) => {
  // Generate request ID if not exists
  const requestId = req.id || uuidv4();
  
  // Default error values
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.code = err.code || 'INTERNAL_SERVER_ERROR';

  // Log error details (server-side only)
  const logData = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id,
    errorCode: error.code,
    errorMessage: error.message,
  };

  // Log stack trace for operational errors in development
  if (process.env.NODE_ENV === 'development') {
    logData.stack = err.stack;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new AppError(message, 409, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File size too large', 400, 'FILE_TOO_LARGE');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new AppError('Too many files uploaded', 400, 'TOO_MANY_FILES');
    } else {
      error = new AppError(err.message, 400, 'FILE_UPLOAD_ERROR');
    }
  }

  // Log error based on severity
  if (error.statusCode >= 500) {
    logger.error('Server Error', { ...logData, stack: err.stack });
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', logData);
  }

  // Prepare client response
  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
    requestId,
  };

  // Add validation details if present
  if (error.details) {
    response.error.details = error.details;
  }

  // In production, don't leak error details
  if (process.env.NODE_ENV === 'production') {
    // Hide implementation details for 500 errors
    if (error.statusCode === 500) {
      response.error.message = 'Internal server error';
    }
  } else {
    // In development, include stack trace
    response.error.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
