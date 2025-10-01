const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
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
    trim: true
  },
  type: {
    type: String,
    enum: ['popup', 'banner', 'slide-in', 'bar', 'modal', 'widget'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  targeting: {
    countries: [String],
    devices: {
      type: [String],
      enum: ['desktop', 'mobile', 'tablet'],
      default: ['desktop', 'mobile', 'tablet']
    },
    browsers: [String],
    referrers: [String],
    pages: [String],
    timeOnSite: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    visitCount: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 0 }
    },
    scrollPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  design: {
    template: {
      type: String,
      required: true
    },
    colors: {
      primary: { type: String, default: '#007bff' },
      secondary: { type: String, default: '#6c757d' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#333333' }
    },
    fonts: {
      heading: { type: String, default: 'Arial' },
      body: { type: String, default: 'Arial' }
    },
    images: [{
      url: String,
      alt: String,
      position: String
    }],
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
    buttonText: {
      type: String,
      default: 'Learn More'
    },
    buttonLink: {
      type: String,
      default: '#'
    },
    formFields: [{
      type: {
        type: String,
        enum: ['text', 'email', 'phone', 'select', 'checkbox', 'textarea'],
        required: true
      },
      label: {
        type: String,
        required: true
      },
      placeholder: String,
      required: {
        type: Boolean,
        default: false
      },
      options: [String] // For select fields
    }]
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
      start: {
        type: String,
        default: '00:00'
      },
      end: {
        type: String,
        default: '23:59'
      }
    }
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    submissions: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  settings: {
    frequency: {
      type: String,
      enum: ['once', 'daily', 'session'],
      default: 'once'
    },
    delay: {
      type: Number,
      default: 0 // seconds
    },
    closeButton: {
      type: Boolean,
      default: true
    },
    overlay: {
      type: Boolean,
      default: true
    },
    sound: {
      type: Boolean,
      default: false
    },
    animation: {
      type: String,
      enum: ['fade', 'slide', 'bounce', 'zoom'],
      default: 'fade'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
campaignSchema.index({ user: 1, status: 1 });
campaignSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

module.exports = mongoose.model('Campaign', campaignSchema);