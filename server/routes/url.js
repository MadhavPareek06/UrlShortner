const express = require('express');
const router = express.Router();

const {
  shortenUrl,
  getAllUrls,
  getUrlByShortId,
  updateUrl,
  deleteUrl,
  getUrlAnalytics,
  getDashboardStats,
  healthCheck
} = require('../controllers/urlController');

// Middleware
const {
  authenticate,
  optionalAuth,
  checkResourceOwnership
} = require('../middleware/auth');

const {
  validateUrlShorten,
  validateUrlUpdate,
  validateShortId,
  validatePagination
} = require('../middleware/validation');

// Health check
router.get('/health', healthCheck);

// Test auth endpoint
router.get('/test-auth', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Dashboard statistics (requires authentication)
router.get('/dashboard/stats', (req, res, next) => {
  console.log('🎯 Dashboard stats route hit!');
  next();
}, authenticate, getDashboardStats);

// URL management routes
router.post('/shorten', optionalAuth, validateUrlShorten, shortenUrl);
router.get('/urls', optionalAuth, validatePagination, getAllUrls);
router.get('/urls/:shortId', optionalAuth, validateShortId, getUrlByShortId);
router.put('/urls/:shortId', authenticate, validateShortId, validateUrlUpdate, updateUrl);
router.delete('/urls/:shortId', authenticate, validateShortId, deleteUrl);

// Analytics routes (requires authentication)
router.get('/analytics/:shortId', authenticate, validateShortId, getUrlAnalytics);

module.exports = router;
