import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Rate Limiting Configuration
 * Protect against brute force and DoS attacks
 */

// Custom rate limit handler
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.originalUrl,
    method: req.method,
  });

  throw new RateLimitError('Too many requests from this IP, please try again later');
};

// Global rate limiter - applies to all API routes
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT) || 5, // 5 attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: rateLimitHandler,
});

// Registration rate limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.REGISTER_RATE_LIMIT) || 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP, please try again after an hour',
  handler: rateLimitHandler,
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again after an hour',
  handler: rateLimitHandler,
});

// Booking/request rate limiter
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 booking requests per 15 minutes
  message: 'Too many booking requests, please try again later',
  handler: rateLimitHandler,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: 'Too many upload attempts, please try again later',
  handler: rateLimitHandler,
});

// Admin actions rate limiter (less strict)
export const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // 200 requests per 10 minutes
  message: 'Too many admin requests, please try again later',
  handler: rateLimitHandler,
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please slow down',
  handler: rateLimitHandler,
});

export default {
  global: globalLimiter,
  auth: authLimiter,
  register: registerLimiter,
  passwordReset: passwordResetLimiter,
  booking: bookingLimiter,
  upload: uploadLimiter,
  admin: adminLimiter,
  search: searchLimiter,
};
