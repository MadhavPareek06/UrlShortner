# 🏗️ Backend Architecture & JWT Authentication

## 📋 Overview

Your URL shortener backend has been completely modularized with JWT authentication. Here's the comprehensive architecture breakdown:

## 🗂️ Project Structure

```
server/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── serverConfig.js       # Environment configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── urlController.js      # URL management logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Input validation rules
├── models/
│   ├── User.js              # User schema with auth features
│   └── Url.js               # URL schema with user association
├── routes/
│   ├── auth.js              # Authentication routes
│   └── url.js               # URL management routes
├── utils/
│   └── jwt.js               # JWT utility functions
├── scripts/
│   └── seed.js              # Database seeding
├── index.js                 # Main server file
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## 🔐 Authentication System

### JWT Token Strategy
- **Access Tokens**: Short-lived (15 minutes) for API access
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Token Rotation**: New refresh token on each refresh
- **Multi-device Support**: Multiple refresh tokens per user

### Security Features
- **Password Hashing**: bcryptjs with salt rounds
- **Account Locking**: After 5 failed login attempts
- **Rate Limiting**: Prevents brute force attacks
- **Token Blacklisting**: Secure logout functionality
- **Role-Based Access**: User and admin roles

## 🛡️ Middleware Architecture

### Authentication Middleware
1. **`authenticate`**: Requires valid JWT token
2. **`optionalAuth`**: Optional authentication (doesn't fail if no token)
3. **`authorize`**: Role-based access control
4. **`checkResourceOwnership`**: Ensures users can only access their resources

### Validation Middleware
- **Input Validation**: express-validator for all endpoints
- **Data Sanitization**: Prevents XSS and injection attacks
- **Type Checking**: Ensures correct data types

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Body Parsing**: JSON and URL-encoded data

## 📊 Data Models

### User Model Features
```javascript
{
  username: String,           // Unique username
  email: String,             // Unique email
  password: String,          // Hashed password
  firstName: String,         // Optional first name
  lastName: String,          // Optional last name
  role: String,              // 'user' or 'admin'
  isActive: Boolean,         // Account status
  isEmailVerified: Boolean,  // Email verification status
  lastLogin: Date,           // Last login timestamp
  loginAttempts: Number,     // Failed login counter
  lockUntil: Date,           // Account lock expiration
  refreshTokens: Array,      // Active refresh tokens
  // ... additional security fields
}
```

### URL Model Features
```javascript
{
  originalUrl: String,       // Original long URL
  shortId: String,          // Unique short identifier
  title: String,            // Optional title
  description: String,      // Optional description
  clicks: Number,           // Click counter
  isActive: Boolean,        // Active status
  expiresAt: Date,          // Optional expiration
  createdBy: ObjectId,      // User reference (null for anonymous)
  createdByUsername: String, // Username for display
  lastClickedAt: Date,      // Last click timestamp
  clickHistory: Array,      // Detailed analytics
  // ... timestamps and metadata
}
```

## 🔄 Authentication Flow

### Registration Flow
1. Validate input data
2. Check for existing user
3. Hash password
4. Create user account
5. Generate JWT tokens
6. Return user data and tokens

### Login Flow
1. Validate credentials
2. Check account status
3. Verify password
4. Handle failed attempts
5. Generate new tokens
6. Update last login
7. Return tokens and user data

### Token Refresh Flow
1. Validate refresh token
2. Check token exists in database
3. Generate new token pair
4. Replace old refresh token
5. Return new tokens

## 🛡️ Security Measures

### Password Security
- **Minimum Requirements**: 6+ chars, uppercase, lowercase, number
- **Hashing**: bcryptjs with salt rounds of 12
- **No Plain Text**: Passwords never stored in plain text

### Account Protection
- **Login Attempts**: Max 5 attempts before 2-hour lock
- **Token Expiry**: Short-lived access tokens
- **Secure Headers**: Helmet.js security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Data Protection
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection**: MongoDB prevents SQL injection
- **XSS Protection**: Input sanitization and CSP headers
- **CORS**: Controlled cross-origin access

## 🚀 API Authentication

### Public Endpoints (No Auth Required)
- User registration
- User login
- Token refresh
- Health check
- URL redirection

### Optional Auth Endpoints
- URL shortening (works with/without auth)
- Get URLs (filtered by user if authenticated)
- Get specific URL

### Protected Endpoints (Auth Required)
- Update/delete URLs
- Analytics access
- Dashboard statistics
- Profile management
- Admin functions

## 🔧 Environment Configuration

### Required Environment Variables
```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
MONGO_URI=mongodb://localhost:27017/urlshortener

# Server
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 📈 Benefits of Modular Architecture

### Maintainability
- **Separation of Concerns**: Each module has a specific responsibility
- **Code Reusability**: Middleware and utilities can be reused
- **Easy Testing**: Individual components can be tested in isolation

### Scalability
- **Horizontal Scaling**: Stateless JWT tokens enable load balancing
- **Microservices Ready**: Modules can be extracted to separate services
- **Database Optimization**: Proper indexing and query optimization

### Security
- **Defense in Depth**: Multiple layers of security
- **Principle of Least Privilege**: Users only access what they need
- **Audit Trail**: Comprehensive logging and tracking

## 🎯 Next Steps

1. **Install Dependencies**: `npm install` in server directory
2. **Configure Environment**: Update `.env` file with your settings
3. **Start Server**: `npm run dev`
4. **Test Authentication**: Use the provided endpoints
5. **Frontend Integration**: Update frontend to use auth endpoints

Your backend is now enterprise-ready with robust authentication, security, and modular architecture! 🚀
