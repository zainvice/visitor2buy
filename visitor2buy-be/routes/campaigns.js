const express = require('express');
const Campaign = require('../models/Campaign');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/campaigns
// @desc    Get all campaigns for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (type) query.type = type;

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get campaign by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      user: req.user.id
    };

    const campaign = new Campaign(campaignData);
    await campaign.save();

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error during campaign creation' });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    Object.assign(campaign, req.body);
    await campaign.save();

    res.json({
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: 'Server error during campaign update' });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    
    // Also delete related analytics
    await Analytics.deleteMany({ campaign: req.params.id });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Server error during campaign deletion' });
  }
});

// @route   POST /api/campaigns/:id/duplicate
// @desc    Duplicate campaign
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalCampaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!originalCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const duplicatedCampaign = new Campaign({
      ...originalCampaign.toObject(),
      _id: undefined,
      name: `${originalCampaign.name} (Copy)`,
      status: 'draft',
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        submissions: 0,
        ctr: 0,
        conversionRate: 0
      },
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicatedCampaign.save();

    res.status(201).json({
      message: 'Campaign duplicated successfully',
      campaign: duplicatedCampaign
    });
  } catch (error) {
    console.error('Duplicate campaign error:', error);
    res.status(500).json({ message: 'Server error during campaign duplication' });
  }
});

// @route   POST /api/campaigns/:id/toggle-status
// @desc    Toggle campaign status (active/paused)
// @access  Private
router.post('/:id/toggle-status', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    await campaign.save();

    res.json({
      message: `Campaign ${campaign.status === 'active' ? 'activated' : 'paused'} successfully`,
      campaign
    });
  } catch (error) {
    console.error('Toggle campaign status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/campaigns/:id/preview
// @desc    Get campaign preview data
// @access  Private
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Return campaign data formatted for preview
    const previewData = {
      type: campaign.type,
      design: campaign.design,
      content: campaign.content,
      settings: campaign.settings
    };

    res.json({ preview: previewData });
  } catch (error) {
    console.error('Get campaign preview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;