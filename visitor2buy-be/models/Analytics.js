const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: String,
    enum: ['impression', 'click', 'conversion', 'submission', 'close'],
    required: true
  },
  visitor: {
    sessionId: {
      type: String,
      required: true
    },
    ipAddress: String,
    userAgent: String,
    country: String,
    city: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    os: String,
    referrer: String,
    page: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ campaign: 1, event: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ 'visitor.sessionId': 1 });
analyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);