import { body, query, param } from 'express-validator';

/**
 * Booking Validators
 * Input validation for booking routes
 */

/**
 * Create Talent Booking Validation
 */
export const validateTalentBooking = [
  body('talentId')
    .notEmpty()
    .withMessage('Talent ID is required')
    .isMongoId()
    .withMessage('Invalid talent ID format'),
  
  body('projectType')
    .isIn([
      'Reels / Short Video',
      'Fashion Shoot',
      'Product Commercial',
      'UGC Content',
      'Corporate',
      'Event Coverage',
      'Other'
    ])
    .withMessage('Invalid project type'),
  
  body('shootDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid shoot date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .withMessage('Shoot date must be today or in the future'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Project description must be between 10 and 2000 characters')
    .escape(),
  
  body('budget')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  body('brandNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Brand notes cannot exceed 1000 characters')
    .escape(),
];

/**
 * Create Instagram Promo Booking Validation
 */
export const validateInstagramBooking = [
  body('instagramPageId')
    .notEmpty()
    .withMessage('Instagram page ID is required')
    .isMongoId()
    .withMessage('Invalid Instagram page ID format'),
  
  body('promoType')
    .isIn([
      'Feed Post',
      'Instagram Story',
      'Reel',
      'Story + Reel Combo',
      'Series (3 stories)',
      'IGTV',
      'Carousel Post',
      'Other'
    ])
    .withMessage('Invalid promo type'),
  
  body('goLiveDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid go-live date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .withMessage('Go-live date must be today or in the future'),
  
  body('campaignName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Campaign name cannot exceed 100 characters')
    .escape(),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Campaign brief must be between 10 and 2000 characters')
    .escape(),
  
  body('budget')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  body('brandNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Brand notes cannot exceed 1000 characters')
    .escape(),
];

/**
 * Update Booking Status Validation
 */
export const validateBookingStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('status')
    .optional()
    .isIn(['approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters')
    .escape(),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
    .escape(),
];

/**
 * Get Bookings Query Validation
 */
export const validateGetBookingsQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('bookingType')
    .optional()
    .isIn(['talent', 'instagram'])
    .withMessage('Invalid booking type'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'shootDate', 'goLiveDate'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Booking ID Param Validation
 */
export const validateBookingId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
];

/**
 * Add Review Validation
 */
export const validateReview = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
    .escape(),
];

export default {
  validateTalentBooking,
  validateInstagramBooking,
  validateBookingStatusUpdate,
  validateGetBookingsQuery,
  validateBookingId,
  validateReview,
};
