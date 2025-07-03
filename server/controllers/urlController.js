const { nanoid } = require('nanoid');
const Url = require('../models/Url');

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Helper function to get client IP
const getClientIp = (req) => {
  return req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    '0.0.0.0';
};

// Create a shortened URL
exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl, title, description, expiresAt, customId } = req.body;

    // Validate required fields
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL (must include http:// or https://)'
      });
    }

    // Get user from authentication middleware (optional)
    const user = req.user;

    // For authenticated users, check if they already have this URL
    let existingUrl = null;
    if (user) {
      existingUrl = await Url.findOne({
        originalUrl,
        createdBy: user._id,
        isActive: true
      });
    } else {
      // For anonymous users, check globally
      existingUrl = await Url.findOne({
        originalUrl,
        createdBy: null,
        isActive: true
      });
    }

    if (existingUrl) {
      return res.json({
        success: true,
        data: existingUrl,
        message: 'URL already shortened'
      });
    }

    // Generate short ID
    let shortId = customId || nanoid(8);

    // Ensure shortId is unique
    let attempts = 0;
    while (await Url.findOne({ shortId }) && attempts < 5) {
      shortId = nanoid(8);
      attempts++;
    }

    if (attempts >= 5) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique short ID. Please try again.'
      });
    }

    // Create new URL document
    const urlData = {
      originalUrl: originalUrl.trim(),
      shortId,
      title: title || '',
      description: description || '',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user ? user._id : null,
      createdByUsername: user ? user.username : 'anonymous'
    };

    const newUrl = new Url(urlData);
    await newUrl.save();

    res.status(201).json({
      success: true,
      data: newUrl,
      message: 'URL shortened successfully'
    });

  } catch (err) {
    console.error('Error in shortenUrl:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Short ID already exists. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Redirect to original URL with analytics tracking
exports.redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    // Find the URL
    const url = await Url.findOne({ shortId, isActive: true });

    if (!url) {
      return res.status(404).send(`
        <html>
          <head><title>URL Not Found</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>404 - URL Not Found</h1>
            <p>The short URL you're looking for doesn't exist or has been deactivated.</p>
            <a href="/">Go to Homepage</a>
          </body>
        </html>
      `);
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send(`
        <html>
          <head><title>URL Expired</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>410 - URL Expired</h1>
            <p>This short URL has expired and is no longer available.</p>
            <a href="/">Go to Homepage</a>
          </body>
        </html>
      `);
    }

    // Track the click
    const clickData = {
      timestamp: new Date(),
      userAgent: req.get('User-Agent') || '',
      ip: getClientIp(req),
      referer: req.get('Referer') || ''
    };

    // Update analytics
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      $set: { lastClickedAt: new Date() },
      $push: { clickHistory: clickData }
    });

    // Redirect to original URL
    return res.redirect(301, url.originalUrl);

  } catch (err) {
    console.error('Error in redirectUrl:', err);
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>500 - Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
          <a href="/">Go to Homepage</a>
        </body>
      </html>
    `);
  }
};

// Get all URLs with pagination and filtering
exports.getAllUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search || '';
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const user = req.user; // From authentication middleware

    // Build filter object
    const filter = {};

    // Filter by user ownership
    if (user) {
      if (user.role === 'admin') {
        // Admin can see all URLs, no additional filter needed
      } else {
        // Regular users can only see their own URLs
        filter.createdBy = user._id;
      }
    } else {
      // Anonymous users can only see anonymous URLs
      filter.createdBy = null;
    }

    if (search) {
      filter.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { shortId: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get URLs with pagination
    const urls = await Url.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-clickHistory'); // Exclude detailed click history for performance

    // Get total count for pagination
    const total = await Url.countDocuments(filter);

    res.json({
      success: true,
      data: {
        urls,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUrls: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (err) {
    console.error('Error in getAllUrls:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch URLs'
    });
  }
};

// Get a single URL by shortId with analytics
exports.getUrlByShortId = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    res.json({
      success: true,
      data: url
    });

  } catch (err) {
    console.error('Error in getUrlByShortId:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch URL'
    });
  }
};

// Update URL details
exports.updateUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { title, description, isActive, expiresAt } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const url = await Url.findOneAndUpdate(
      { shortId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    res.json({
      success: true,
      data: url,
      message: 'URL updated successfully'
    });

  } catch (err) {
    console.error('Error in updateUrl:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update URL'
    });
  }
};

// Delete URL (soft delete by setting isActive to false)
exports.deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOneAndUpdate(
      { shortId },
      { isActive: false },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    res.json({
      success: true,
      message: 'URL deleted successfully'
    });

  } catch (err) {
    console.error('Error in deleteUrl:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete URL'
    });
  }
};

// Get analytics for a specific URL
exports.getUrlAnalytics = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalClicks: url.clicks,
      lastClickedAt: url.lastClickedAt,
      createdAt: url.createdAt,
      isActive: url.isActive,
      expiresAt: url.expiresAt,
      clickHistory: url.clickHistory.slice(-50), // Last 50 clicks
      dailyClicks: {},
      topReferrers: {},
      topUserAgents: {}
    };

    // Process click history for insights
    url.clickHistory.forEach(click => {
      // Daily clicks
      const date = click.timestamp.toISOString().split('T')[0];
      analytics.dailyClicks[date] = (analytics.dailyClicks[date] || 0) + 1;

      // Top referrers
      const referer = click.referer || 'Direct';
      analytics.topReferrers[referer] = (analytics.topReferrers[referer] || 0) + 1;

      // Top user agents (simplified)
      const userAgent = click.userAgent || 'Unknown';
      const browser = userAgent.includes('Chrome') ? 'Chrome' :
        userAgent.includes('Firefox') ? 'Firefox' :
          userAgent.includes('Safari') ? 'Safari' :
            userAgent.includes('Edge') ? 'Edge' : 'Other';
      analytics.topUserAgents[browser] = (analytics.topUserAgents[browser] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (err) {
    console.error('Error in getUrlAnalytics:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Get overall dashboard statistics
exports.getDashboardStats = async (req, res) => {
  console.log('🚀 getDashboardStats function called!');
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Request user:', req.user);

  try {
    const user = req.user; // From authentication middleware
    console.log('Dashboard stats request from user:', user?.username, user?._id);

    // Build filter based on user role
    let filter = {};
    if (user) {
      if (user.role === 'admin') {
        // Admin can see all URLs
        filter = {};
        console.log('Admin user - showing all URLs');
      } else {
        // Regular users can only see their own URLs
        filter = { createdBy: user._id };
        console.log('Regular user - filtering by createdBy:', user._id);
      }
    } else {
      // This shouldn't happen since route requires auth, but fallback to empty
      filter = { createdBy: null };
      console.log('No user found - using anonymous filter');
    }

    const totalUrls = await Url.countDocuments(filter);
    const activeUrls = await Url.countDocuments({ ...filter, isActive: true });

    // Get total clicks for user's URLs
    const totalClicksResult = await Url.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    // Get recent URLs for this user
    const recentUrls = await Url.find({ ...filter, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalUrl shortId clicks createdAt title');

    // Get top URLs by clicks for this user
    const topUrls = await Url.find({ ...filter, isActive: true })
      .sort({ clicks: -1 })
      .limit(5)
      .select('originalUrl shortId clicks title');

    const statsData = {
      totalUrls,
      activeUrls,
      inactiveUrls: totalUrls - activeUrls,
      totalClicks: totalClicksResult[0]?.total || 0,
      recentUrls,
      topUrls
    };

    console.log('Dashboard stats calculated:', statsData);

    res.json({
      success: true,
      data: statsData
    });

  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await Url.findOne().limit(1);

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });

  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
};
