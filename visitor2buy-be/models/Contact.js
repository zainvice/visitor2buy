const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    enum: ['campaign', 'contact-form', 'api'],
    default: 'contact-form'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  tags: [String],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visitor: {
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    referrer: String,
    page: String
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
contactSchema.index({ user: 1, status: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ campaign: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);