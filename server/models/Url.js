const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  clicks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdByUsername: {
    type: String,
    default: 'anonymous'
  },
  lastClickedAt: {
    type: Date,
    default: null
  },
  clickHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ip: String,
    referer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
urlSchema.index({ createdAt: -1 });
urlSchema.index({ clicks: -1 });
urlSchema.index({ isActive: 1 });

// Update the updatedAt field before saving
urlSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted creation date
urlSchema.virtual('formattedCreatedAt').get(function () {
  return this.createdAt ? this.createdAt.toLocaleDateString() : 'N/A';
});

// Virtual for short URL
urlSchema.virtual('shortUrl').get(function () {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/${this.shortId}`;
});

// Ensure virtual fields are serialized
urlSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
