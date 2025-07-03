const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value) => {
      // Additional custom validation can be added here
      return true;
    }),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name can only contain letters and spaces')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Identifier must be between 3 and 100 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password cannot exceed 128 characters')
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name can only contain letters and spaces')
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for URL shortening
 */
const validateUrlShorten = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Please provide a valid URL with http:// or https://')
    .isLength({ max: 2048 })
    .withMessage('URL cannot exceed 2048 characters'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('customId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Custom ID must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Custom ID can only contain letters, numbers, hyphens, and underscores'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
];

/**
 * Validation rules for URL update
 */
const validateUrlUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
];

/**
 * Validation rules for shortId parameter
 */
const validateShortId = [
  param('shortId')
    .trim()
    .notEmpty()
    .withMessage('Short ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Short ID must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Short ID contains invalid characters')
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'clicks', 'title'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
    .toBoolean()
];

/**
 * Validation rules for email
 */
const validateEmail = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
];

/**
 * Validation rules for password reset
 */
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateUrlShorten,
  validateUrlUpdate,
  validateShortId,
  validatePagination,
  validateEmail,
  validatePasswordReset
};
