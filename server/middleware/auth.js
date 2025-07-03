const User = require('../models/User');
const jwtUtils = require('../utils/jwt');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - checking authentication');
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = jwtUtils.verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find the user
    console.log('👤 Looking for user with ID:', decoded.id);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.username);

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.message.includes('jwt expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('invalid signature')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify the token
    const decoded = jwtUtils.verifyAccessToken(token);

    if (decoded.type !== 'access') {
      req.user = null;
      return next();
    }

    // Find the user
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive || user.isLocked) {
      req.user = null;
      return next();
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
};

/**
 * Authorization middleware - checks user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = authorize('admin');

/**
 * User or admin middleware
 */
const userOrAdmin = authorize('user', 'admin');

/**
 * Resource ownership middleware - checks if user owns the resource
 */
const checkResourceOwnership = (resourceField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if the resource belongs to the user
    if (req.resource && req.resource[resourceField]) {
      const resourceOwnerId = req.resource[resourceField].toString();
      const userId = req.user._id.toString();

      if (resourceOwnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources'
        });
      }
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // temporarily very high for debugging
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for successful requests
    return req.user !== undefined;
  }
});

/**
 * Refresh token validation middleware
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify the refresh token
    const decoded = jwtUtils.verifyRefreshToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find the user and check if refresh token exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    console.error('Refresh token validation error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  userOrAdmin,
  checkResourceOwnership,
  authRateLimit,
  validateRefreshToken
};
