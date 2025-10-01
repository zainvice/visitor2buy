const express = require('express');
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// @route   POST /api/contact/submit
// @desc    Submit contact form
// @access  Public
router.post('/submit', async (req, res) => {
  try {
    const {
      campaignId,
      name,
      email,
      phone,
      company,
      message,
      formData,
      visitor
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Find campaign to get user
    let userId = null;
    if (campaignId) {
      const Campaign = require('../models/Campaign');
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        userId = campaign.user;
      }
    }

    // Create contact record
    const contact = new Contact({
      campaign: campaignId || null,
      user: userId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      company: company || '',
      message: message || '',
      formData: formData || {},
      source: campaignId ? 'campaign' : 'contact-form',
      visitor: visitor || {}
    });

    await contact.save();

    // Send notification email to user if available
    if (userId) {
      try {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user && user.preferences.notifications.email) {
          await sendEmail({
            to: user.email,
            subject: 'New Contact Form Submission - Visitor2Buy',
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            `
          });
        }
      } catch (emailError) {
        console.error('Notification email failed:', emailError);
      }
    }

    // Send auto-reply to submitter
    try {
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting us',
        html: `
          <h2>Thank you for your message!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>The Team</p>
        `
      });
    } catch (emailError) {
      console.error('Auto-reply email failed:', emailError);
    }

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error during form submission' });
  }
});

// @route   GET /api/contact
// @desc    Get all contacts for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      campaign,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (campaign) query.campaign = campaign;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('campaign', 'name type')
      .populate('user', 'name email');

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('campaign', 'name type')
    .populate('notes.addedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'tags', 'isSubscribed'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    });

    if (req.body.isSubscribed === false && contact.isSubscribed) {
      contact.unsubscribedAt = new Date();
    }

    await contact.save();

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error during contact update' });
  }
});

// @route   POST /api/contact/:id/notes
// @desc    Add note to contact
// @access  Private
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.notes.push({
      content,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await contact.save();

    res.status(201).json({
      message: 'Note added successfully',
      contact
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error during note addition' });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error during contact deletion' });
  }
});

// @route   GET /api/contact/export/csv
// @desc    Export contacts as CSV
// @access  Private
router.get('/export/csv', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id })
      .populate('campaign', 'name')
      .sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeader = 'Name,Email,Phone,Company,Status,Campaign,Created At,Message\n';
    const csvRows = contacts.map(contact => {
      return [
        contact.name,
        contact.email,
        contact.phone || '',
        contact.company || '',
        contact.status,
        contact.campaign?.name || '',
        contact.createdAt.toISOString(),
        (contact.message || '').replace(/"/g, '""')
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

module.exports = router;