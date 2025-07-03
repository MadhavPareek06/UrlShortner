const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

class JWTUtils {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Generate access token
   * @param {Object} payload - User payload
   * @returns {String} Access token
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        type: 'access'
      },
      this.accessTokenSecret,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client',
        jwtid: nanoid()
      }
    );
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User payload
   * @returns {String} Refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        type: 'refresh'
      },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client',
        jwtid: nanoid()
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Token pair
   */
  generateTokenPair(user) {
    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Verify access token
   * @param {String} token - Access token
   * @returns {Object} Decoded payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client'
      });
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - Refresh token
   * @returns {Object} Decoded payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client'
      });
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  /**
   * Get token from authorization header
   * @param {String} authHeader - Authorization header
   * @returns {String|null} Token or null
   */
  extractTokenFromHeader(authHeader) {
    console.log('🔍 JWT: Extracting token from header:', authHeader);
    if (!authHeader) {
      console.log('❌ JWT: No auth header provided');
      return null;
    }

    const parts = authHeader.split(' ');
    console.log('🔍 JWT: Header parts:', parts);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('❌ JWT: Invalid header format. Expected "Bearer <token>"');
      return null;
    }

    console.log('✅ JWT: Token extracted successfully');
    return parts[1];
  }

  /**
   * Check if token is expired
   * @param {String} token - JWT token
   * @returns {Boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) return true;

      return Date.now() >= decoded.payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   * @param {String} token - JWT token
   * @returns {Date|null} Expiration date or null
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) return null;

      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate password reset token
   * @param {String} userId - User ID
   * @returns {String} Reset token
   */
  generatePasswordResetToken(userId) {
    return jwt.sign(
      {
        id: userId,
        type: 'password-reset'
      },
      this.accessTokenSecret,
      {
        expiresIn: '1h',
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client'
      }
    );
  }

  /**
   * Generate email verification token
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @returns {String} Verification token
   */
  generateEmailVerificationToken(userId, email) {
    return jwt.sign(
      {
        id: userId,
        email: email,
        type: 'email-verification'
      },
      this.accessTokenSecret,
      {
        expiresIn: '24h',
        issuer: 'urlshortener-api',
        audience: 'urlshortener-client'
      }
    );
  }
}

module.exports = new JWTUtils();
