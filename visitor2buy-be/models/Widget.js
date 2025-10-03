const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
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
  type: {
    type: String,
    enum: ['popup', 'banner', 'slide-in', 'floating-button', 'chat-widget', 'notification-bar', 'exit-intent', 'cta-button'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  targeting: {
    // Device targeting
    devices: {
      type: [String],
      enum: ['desktop', 'mobile', 'tablet'],
      default: ['desktop', 'mobile', 'tablet']
    },
    // Page targeting
    pages: {
      include: [String], // URL patterns to include
      exclude: [String]  // URL patterns to exclude
    },
    // Geographic targeting
    countries: [String],
    // Time-based targeting
    timeOnSite: {
      min: { type: Number, default: 0 }, // seconds
      max: { type: Number, default: 0 }  // 0 means no limit
    },
    // Scroll targeting
    scrollPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0 // 0 means no scroll trigger
    },
    // Exit intent
    exitIntent: {
      type: Boolean,
      default: false
    },
    // Visit count targeting
    visitCount: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 0 } // 0 means no limit
    },
    // Traffic source
    referrers: [String],
    // Custom rules
    customRules: [{
      field: String,    // e.g., 'url', 'referrer', 'userAgent'
      operator: String, // e.g., 'contains', 'equals', 'startsWith'
      value: String
    }]
  },
  design: {
    template: {
      type: String,
      required: true,
      default: 'default'
    },
    position: {
      type: String,
      enum: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'],
      default: 'center'
    },
    size: {
      width: { type: String, default: '400px' },
      height: { type: String, default: 'auto' }
    },
    colors: {
      primary: { type: String, default: '#007bff' },
      secondary: { type: String, default: '#6c757d' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#333333' },
      border: { type: String, default: '#dee2e6' }
    },
    typography: {
      fontFamily: { type: String, default: 'Arial, sans-serif' },
      fontSize: { type: String, default: '16px' },
      fontWeight: { type: String, default: 'normal' }
    },
    spacing: {
      padding: { type: String, default: '20px' },
      margin: { type: String, default: '0px' },
      borderRadius: { type: String, default: '8px' }
    },
    effects: {
      shadow: { type: String, default: '0 4px 6px rgba(0, 0, 0, 0.1)' },
      animation: {
        type: String,
        enum: ['none', 'fade', 'slide', 'bounce', 'zoom', 'flip'],
        default: 'fade'
      },
      duration: { type: Number, default: 300 } // milliseconds
    },
    customCSS: {
      type: String,
      default: ''
    }
  },
  content: {
    headline: {
      type: String,
      required: true
    },
    subheadline: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    images: [{
      url: String,
      alt: String,
      position: {
        type: String,
        enum: ['top', 'bottom', 'left', 'right', 'background'],
        default: 'top'
      }
    }],
    buttons: [{
      text: { type: String, required: true },
      action: {
        type: String,
        enum: ['url', 'close', 'form', 'phone', 'email'],
        required: true
      },
      value: String, // URL, phone number, email, etc.
      style: {
        type: String,
        enum: ['primary', 'secondary', 'outline', 'link'],
        default: 'primary'
      },
      position: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center'
      }
    }],
    form: {
      enabled: { type: Boolean, default: false },
      fields: [{
        type: {
          type: String,
          enum: ['text', 'email', 'phone', 'select', 'checkbox', 'textarea', 'number'],
          required: true
        },
        name: { type: String, required: true },
        label: { type: String, required: true },
        placeholder: String,
        required: { type: Boolean, default: false },
        options: [String], // For select fields
        validation: {
          pattern: String,
          message: String
        }
      }],
      submitText: { type: String, default: 'Submit' },
      successMessage: { type: String, default: 'Thank you for your submission!' },
      redirectUrl: String
    }
  },
  triggers: {
    delay: {
      type: Number,
      default: 0 // seconds
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'session', 'always'],
      default: 'once'
    },
    cookieDuration: {
      type: Number,
      default: 30 // days
    }
  },
  settings: {
    closeButton: {
      enabled: { type: Boolean, default: true },
      position: {
        type: String,
        enum: ['top-right', 'top-left', 'inside', 'outside'],
        default: 'top-right'
      }
    },
    overlay: {
      enabled: { type: Boolean, default: true },
      color: { type: String, default: 'rgba(0, 0, 0, 0.5)' },
      clickToClose: { type: Boolean, default: true }
    },
    sound: {
      enabled: { type: Boolean, default: false },
      url: String
    },
    responsive: {
      enabled: { type: Boolean, default: true },
      breakpoints: {
        mobile: { type: String, default: '768px' },
        tablet: { type: String, default: '1024px' }
      }
    }
  },
  schedule: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6] // 0 = Sunday, 6 = Saturday
    },
    timeRange: {
      start: { type: String, default: '00:00' },
      end: { type: String, default: '23:59' }
    }
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    closes: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    conversionRate: { type: Number, default: 0 },
    lastShown: { type: Date }
  }
}, {
  timestamps: true
});

// Calculate CTR and conversion rate before saving
widgetSchema.pre('save', function(next) {
  if (this.analytics.impressions > 0) {
    this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
    this.analytics.conversionRate = (this.analytics.conversions / this.analytics.impressions) * 100;
  }
  next();
});

// Index for better query performance
widgetSchema.index({ user: 1, status: 1 });
widgetSchema.index({ project: 1, status: 1 });
widgetSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
widgetSchema.index({ type: 1 });

module.exports = mongoose.model('Widget', widgetSchema);