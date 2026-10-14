import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import rateLimiters from '../middleware/rateLimiter.js';
import { validateInstagramPageSearch } from '../validators/search.validators.js';
import {
  getInstagramPages,
  getInstagramPageById,
  updateInstagramPage,
  deleteInstagramPage,
  getInstagramPageStats,
} from '../controllers/instagramPage.controller.js';

const router = express.Router();

/**
 * Instagram Page Routes
 * Browse and manage Instagram page profiles
 */

// GET /api/v1/instagram-pages - Get all Instagram pages
router.get(
  '/',
  rateLimiters.search,
  validateInstagramPageSearch,
  validateRequest,
  optionalAuth,
  getInstagramPages
);

// GET /api/v1/instagram-pages/stats/overview - Get page stats (own profile)
router.get(
  '/stats/overview',
  authenticate,
  authorize('igpage'),
  getInstagramPageStats
);

// GET /api/v1/instagram-pages/:id - Get Instagram page by ID
router.get(
  '/:id',
  optionalAuth,
  getInstagramPageById
);

// PUT /api/v1/instagram-pages/:id - Update Instagram page (own profile only)
router.put(
  '/:id',
  authenticate,
  authorize('igpage', 'admin'),
  updateInstagramPage
);

// DELETE /api/v1/instagram-pages/:id - Delete Instagram page (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteInstagramPage
);

export default router;
