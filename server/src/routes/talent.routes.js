import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import rateLimiters from '../middleware/rateLimiter.js';
import { validateTalentSearch } from '../validators/search.validators.js';
import {
  getTalent,
  getTalentById,
  updateTalent,
  deleteTalent,
  getTalentStats,
} from '../controllers/talent.controller.js';

const router = express.Router();

/**
 * Talent Routes
 * Browse and manage talent profiles
 */

// GET /api/v1/talent - Get all talent (public with filters)
router.get(
  '/',
  rateLimiters.search,
  validateTalentSearch,
  validateRequest,
  optionalAuth,
  getTalent
);

// GET /api/v1/talent/stats/overview - Get talent stats (own profile)
router.get(
  '/stats/overview',
  authenticate,
  authorize('talent'),
  getTalentStats
);

// GET /api/v1/talent/:id - Get talent by ID
router.get(
  '/:id',
  optionalAuth,
  getTalentById
);

// PUT /api/v1/talent/:id - Update talent profile (own profile only)
router.put(
  '/:id',
  authenticate,
  authorize('talent', 'admin'),
  updateTalent
);

// DELETE /api/v1/talent/:id - Delete talent (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteTalent
);

export default router;
