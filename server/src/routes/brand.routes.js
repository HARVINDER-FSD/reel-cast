import express from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import {
  getBrandProfile,
  updateBrandProfile,
  getSubscription,
  getBrandDashboard,
} from '../controllers/brand.controller.js';

const router = express.Router();

/**
 * Brand Routes
 * Brand profile and subscription management
 */

// GET /api/v1/brands/me - Get brand profile
router.get(
  '/me',
  authenticate,
  authorize('brand'),
  getBrandProfile
);

// PUT /api/v1/brands/me - Update brand profile
router.put(
  '/me',
  authenticate,
  authorize('brand'),
  updateBrandProfile
);

// GET /api/v1/brands/subscription - Get subscription details
router.get(
  '/subscription',
  authenticate,
  authorize('brand'),
  getSubscription
);

// GET /api/v1/brands/dashboard - Get dashboard data
router.get(
  '/dashboard',
  authenticate,
  authorize('brand'),
  getBrandDashboard
);

export default router;
