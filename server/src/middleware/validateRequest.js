import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/AppError.js';

/**
 * Validation Middleware
 * Check express-validator results and throw formatted errors
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};

export default validateRequest;
