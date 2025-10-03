const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  allowedDomains: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    gdprCompliant: {
      type: Boolean,
      default: false
    },
    cookieConsent: {
      type: Boolean,
      default: false
    },
    customCSS: {
      type: String,
      default: ''
    },
    customJS: {
      type: String,
      default: ''
    }
  },
  branding: {
    showPoweredBy: {
      type: Boolean,
      default: function() {
        // Show branding for free users
        return this.user && this.user.subscription && this.user.subscription.plan === 'free';
      }
    },
    customLogo: {
      type: String,
      default: ''
    },
    customColors: {
      primary: { type: String, default: '#007bff' },
      secondary: { type: String, default: '#6c757d' }
    }
  },
  analytics: {
    totalPageViews: {
      type: Number,
      default: 0
    },
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  embedCode: {
    type: String,
    unique: true,
    required: true
  },
  apiKey: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate unique embed code and API key before saving
projectSchema.pre('save', function(next) {
  if (!this.embedCode) {
    this.embedCode = generateRandomString(32);
  }
  if (!this.apiKey) {
    this.apiKey = 'pk_' + generateRandomString(40);
  }
  next();
});

// Helper function to generate random strings
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Index for better query performance
projectSchema.index({ user: 1, status: 1 });
projectSchema.index({ domain: 1 });
projectSchema.index({ embedCode: 1 });
projectSchema.index({ apiKey: 1 });

module.exports = mongoose.model('Project', projectSchema);