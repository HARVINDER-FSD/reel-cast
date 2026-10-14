import express from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  updatePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import rateLimiters from '../middleware/rateLimiter.js';
import {
  validateTalentRegistration,
  validateInstagramPageRegistration,
  validateBrandRegistration,
  validateLogin,
  validatePasswordUpdate,
} from '../validators/auth.validators.js';

const router = express.Router();

/**
 * Registration Routes
 * Different validators based on role
 */

// Talent registration
router.post(
  '/register/talent',
  rateLimiters.register,
  validateTalentRegistration,
  validateRequest,
  (req, res, next) => {
    req.body.role = 'talent';
    next();
  },
  register
);

// Instagram Page registration
router.post(
  '/register/igpage',
  rateLimiters.register,
  validateInstagramPageRegistration,
  validateRequest,
  (req, res, next) => {
    req.body.role = 'igpage';
    next();
  },
  register
);

// Brand registration
router.post(
  '/register/brand',
  rateLimiters.register,
  validateBrandRegistration,
  validateRequest,
  (req, res, next) => {
    req.body.role = 'brand';
    next();
  },
  register
);

/**
 * Authentication Routes
 */

// Login
router.post(
  '/login',
  rateLimiters.auth,
  validateLogin,
  validateRequest,
  login
);

// Logout (requires authentication)
router.post(
  '/logout',
  authenticate,
  logout
);

// Refresh access token
router.post(
  '/refresh',
  refreshAccessToken
);

/**
 * User Profile Routes
 */

// Get current user
router.get(
  '/me',
  authenticate,
  getCurrentUser
);

// Update password
router.put(
  '/update-password',
  authenticate,
  validatePasswordUpdate,
  validateRequest,
  updatePassword
);

export default router;
