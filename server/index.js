const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/serverConfig');
const connectDB = require('./config/db');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: config.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
const urlRoutes = require('./routes/url');
const authRoutes = require('./routes/auth');
const { redirectUrl } = require('./controllers/urlController');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      shorten: 'POST /api/shorten',
      urls: 'GET /api/urls',
      analytics: 'GET /api/analytics/:shortId',
      health: 'GET /api/health',
      redirect: 'GET /:shortId'
    }
  });
});

// Short URL redirection (must be after API routes)
app.get('/:shortId', redirectUrl);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't leak error details in production
  const isDevelopment = config.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

// Start server (for traditional hosting like Render)
// Only skip for Vercel serverless
if (process.env.VERCEL !== '1') {
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`🌐 CORS origin: ${config.CORS_ORIGIN}`);
    console.log(`🔗 Base URL: ${config.BASE_URL}`);
  });
}

// Export for Vercel
module.exports = app;

