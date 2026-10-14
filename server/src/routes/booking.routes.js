import express from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import rateLimiters from '../middleware/rateLimiter.js';
import {
  validateTalentBooking,
  validateInstagramBooking,
  validateBookingStatusUpdate,
  validateGetBookingsQuery,
  validateBookingId,
  validateReview,
} from '../validators/booking.validators.js';
import {
  createTalentBooking,
  createInstagramBooking,
  getBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  completeBooking,
  addReview,
} from '../controllers/booking.controller.js';

const router = express.Router();

/**
 * Booking Routes
 * Manage booking requests between brands and talent/pages
 */

// POST /api/v1/bookings/talent - Create talent booking
router.post(
  '/talent',
  authenticate,
  authorize('brand'),
  rateLimiters.booking,
  validateTalentBooking,
  validateRequest,
  createTalentBooking
);

// POST /api/v1/bookings/instagram - Create Instagram promo booking
router.post(
  '/instagram',
  authenticate,
  authorize('brand'),
  rateLimiters.booking,
  validateInstagramBooking,
  validateRequest,
  createInstagramBooking
);

// GET /api/v1/bookings - Get user's bookings
router.get(
  '/',
  authenticate,
  validateGetBookingsQuery,
  validateRequest,
  getBookings
);

// GET /api/v1/bookings/:id - Get booking by ID
router.get(
  '/:id',
  authenticate,
  validateBookingId,
  validateRequest,
  getBookingById
);

// PUT /api/v1/bookings/:id/approve - Approve booking (admin only)
router.put(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  validateBookingId,
  validateRequest,
  approveBooking
);

// PUT /api/v1/bookings/:id/reject - Reject booking (admin only)
router.put(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  validateBookingStatusUpdate,
  validateRequest,
  rejectBooking
);

// PUT /api/v1/bookings/:id/complete - Mark booking as complete
router.put(
  '/:id/complete',
  authenticate,
  validateBookingId,
  validateRequest,
  completeBooking
);

// POST /api/v1/bookings/:id/review - Add review/rating
router.post(
  '/:id/review',
  authenticate,
  authorize('brand'),
  validateReview,
  validateRequest,
  addReview
);

export default router;
