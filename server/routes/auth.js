const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// Middleware
const {
  authenticate,
  authRateLimit,
  validateRefreshToken
} = require('../middleware/auth');

const {
  validateRegister,
  validateLogin,
  validateProfileUpdate
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validateLogin, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh', validateRefreshToken, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (remove refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

module.exports = router;
