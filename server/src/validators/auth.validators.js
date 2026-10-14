import { body } from 'express-validator';

/**
 * Authentication Validators
 * Input validation for auth routes
 */

// Common password rules
const passwordRules = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Common email rules
const emailRules = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .toLowerCase();

// Common phone rules
const phoneRules = body('phone')
  .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
  .withMessage('Please provide a valid phone number');

/**
 * Talent Registration Validation
 */
export const validateTalentRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  emailRules,
  passwordRules,
  phoneRules,
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters')
    .escape(),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('category')
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
  
  body('rate')
    .isInt({ min: 500, max: 1000000 })
    .withMessage('Rate must be between ₹500 and ₹10,00,000'),
  
  body('experience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Experienced', 'Professional'])
    .withMessage('Invalid experience level'),
];

/**
 * Instagram Page Registration Validation
 */
export const validateInstagramPageRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  emailRules,
  passwordRules,
  phoneRules,
  
  body('handle')
    .trim()
    .matches(/^@?[a-zA-Z0-9._]+$/)
    .withMessage('Invalid Instagram handle format')
    .customSanitizer(value => value.startsWith('@') ? value : `@${value}`)
    .toLowerCase(),
  
  body('niche')
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
  
  body('followers')
    .trim()
    .notEmpty()
    .withMessage('Follower count is required'),
  
  body('followerCount')
    .isInt({ min: 1000 })
    .withMessage('Minimum 1,000 followers required'),
  
  body('engagementRate')
    .trim()
    .matches(/^\d+(\.\d+)?%?$/)
    .withMessage('Invalid engagement rate format'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .escape(),
  
  body('postRate')
    .isInt({ min: 500, max: 1000000 })
    .withMessage('Post rate must be between ₹500 and ₹10,00,000'),
  
  body('storyRate')
    .isInt({ min: 300, max: 500000 })
    .withMessage('Story rate must be between ₹300 and ₹5,00,000'),
  
  body('reelRate')
    .isInt({ min: 1000, max: 2000000 })
    .withMessage('Reel rate must be between ₹1,000 and ₹20,00,000'),
  
  body('about')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('About section cannot exceed 1000 characters')
    .escape(),
];

/**
 * Brand Registration Validation
 */
export const validateBrandRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  emailRules,
  passwordRules,
  phoneRules,
  
  body('brandName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters')
    .escape(),
  
  body('plan')
    .isIn(['starter', 'growth', 'pro'])
    .withMessage('Invalid subscription plan'),
  
  body('companyType')
    .optional()
    .isIn(['Brand', 'Agency', 'Startup', 'Enterprise', 'Individual'])
    .withMessage('Invalid company type'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
];

/**
 * Login Validation
 */
export const validateLogin = [
  emailRules,
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Password Update Validation
 */
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

export default {
  validateTalentRegistration,
  validateInstagramPageRegistration,
  validateBrandRegistration,
  validateLogin,
  validatePasswordUpdate,
};
