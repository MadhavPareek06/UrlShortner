# URL Shortener Backend

A robust, modular Node.js backend for the URL shortener application with JWT authentication, analytics tracking, and comprehensive API endpoints.

## 🚀 Features

### Core Features
- ✅ **URL Shortening** - Create short URLs with custom IDs
- 📊 **Analytics Tracking** - Track clicks, referrers, user agents
- 🔍 **URL Management** - CRUD operations for URLs
- 📈 **Dashboard Statistics** - Overview of URL performance
- 🛡️ **URL Validation** - Ensure valid URLs and security
- ⏰ **Expiration Support** - Set expiration dates for URLs
- 🔄 **Soft Delete** - Deactivate URLs instead of permanent deletion

### Authentication & Security
- 🔐 **JWT Authentication** - Access and refresh token system
- 👤 **User Management** - Registration, login, profile management
- 🛡️ **Role-Based Access** - User and admin roles
- 🔒 **Account Security** - Password hashing, login attempt limiting
- 🚫 **Rate Limiting** - Prevent abuse and spam
- 🛡️ **Security Headers** - Helmet.js integration
- 🔑 **Token Management** - Secure token storage and rotation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/verify-token` - Verify token validity

### URL Management
- `POST /api/shorten` - Create a short URL (optional auth)
- `GET /api/urls` - Get URLs with pagination (optional auth)
- `GET /api/urls/:shortId` - Get specific URL details (optional auth)
- `PUT /api/urls/:shortId` - Update URL details (requires auth)
- `DELETE /api/urls/:shortId` - Soft delete URL (requires auth)

### Analytics
- `GET /api/analytics/:shortId` - Get detailed analytics (requires auth)
- `GET /api/dashboard/stats` - Get dashboard statistics (requires auth)

### System
- `GET /api/health` - Health check endpoint
- `GET /:shortId` - Redirect to original URL

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system

4. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/urlshortener` |
| `BASE_URL` | Base URL for short links | `http://localhost:5000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

## Database Schema

### URL Model
```javascript
{
  originalUrl: String,      // The original long URL
  shortId: String,          // Unique short identifier
  title: String,            // Optional title
  description: String,      // Optional description
  clicks: Number,           // Total click count
  isActive: Boolean,        // Active status
  expiresAt: Date,          // Optional expiration date
  createdBy: String,        // Creator identifier
  lastClickedAt: Date,      // Last click timestamp
  clickHistory: Array,      // Detailed click analytics
  createdAt: Date,          // Creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

## API Response Format

All API responses follow this format:
```javascript
{
  success: boolean,
  data?: any,
  message?: string,
  pagination?: {
    currentPage: number,
    totalPages: number,
    totalUrls: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `410` - Gone (expired URLs)
- `500` - Internal Server Error

## Analytics Features

- **Click Tracking** - Every redirect is tracked
- **User Agent Analysis** - Browser and device information
- **Referrer Tracking** - Source of traffic
- **Geographic Data** - IP-based location (future feature)
- **Time-based Analytics** - Daily/weekly/monthly trends

## Security Features

- URL validation to prevent malicious links
- Rate limiting (configurable)
- CORS protection
- Input sanitization
- Error message sanitization in production

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient aggregation queries for analytics
- Connection pooling for MongoDB

## Development

The server includes helpful development features:
- Request logging
- Detailed error messages in development mode
- Hot reloading with nodemon
- Sample data seeding script
