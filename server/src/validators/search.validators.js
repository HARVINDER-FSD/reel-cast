import { query } from 'express-validator';

/**
 * Search and Filter Validators
 * Input validation for search and browse routes
 */

/**
 * Talent Search/Filter Validation
 */
export const validateTalentSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isIn([
      'Model',
      'Influencer',
      'UGC Creator',
      'Child Artist',
      'Photographer',
      'Videographer',
      'Fitness & Sports',
      'Fashion & Styling',
      'Food Creator',
      'Brand Ambassador',
      'Other'
    ])
    .withMessage('Invalid category'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  query('minRate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum rate must be a positive number'),
  
  query('maxRate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum rate must be a positive number'),
  
  query('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),
  
  query('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),
  
  query('experience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Experienced', 'Professional'])
    .withMessage('Invalid experience level'),
  
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
    .isIn(['rate', 'rating', 'createdAt', 'profileViews', 'completedBookings'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Instagram Page Search/Filter Validation
 */
export const validateInstagramPageSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('niche')
    .optional()
    .isIn([
      'Fashion & Lifestyle',
      'Food & Restaurant',
      'Travel & Adventure',
      'Fitness & Health',
      'Beauty & Makeup',
      'Home Decor',
      'Tech & Gadgets',
      'Memes & Entertainment',
      'Business & Finance',
      'Sports',
      'Parenting',
      'Education',
      'Photography',
      'Art & Design',
      'Music',
      'Other'
    ])
    .withMessage('Invalid niche'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  query('minFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum followers must be a positive number'),
  
  query('maxFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum followers must be a positive number'),
  
  query('followerCategory')
    .optional()
    .isIn(['Nano', 'Micro', 'Mid-tier', 'Macro', 'Mega'])
    .withMessage('Invalid follower category'),
  
  query('minPostRate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum post rate must be a positive number'),
  
  query('maxPostRate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum post rate must be a positive number'),
  
  query('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),
  
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
    .isIn(['followerCount', 'postRate', 'rating', 'createdAt', 'profileViews'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export default {
  validateTalentSearch,
  validateInstagramPageSearch,
};
