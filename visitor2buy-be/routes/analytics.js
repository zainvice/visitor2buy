const express = require('express');
const Analytics = require('../models/Analytics');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track analytics event
// @access  Public (for tracking widgets)
router.post('/track', async (req, res) => {
  try {
    const {
      campaignId,
      event,
      sessionId,
      visitor,
      metadata
    } = req.body;

    // Validate required fields
    if (!campaignId || !event || !sessionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find campaign and get user
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create analytics record
    const analyticsRecord = new Analytics({
      campaign: campaignId,
      user: campaign.user,
      event,
      visitor: {
        sessionId,
        ...visitor
      },
      metadata: metadata || {}
    });

    await analyticsRecord.save();

    // Update campaign analytics
    await updateCampaignAnalytics(campaignId, event);

    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ message: 'Server error during tracking' });
  }
});

// @route   GET /api/analytics/campaigns/:id
// @desc    Get analytics for specific campaign
// @access  Private
router.get('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Verify campaign ownership
    const campaign = await Campaign.findOne({
      _id: id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      campaign: campaign._id
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.timestamp = dateFilter;
    }

    // Aggregate analytics data
    const analytics = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            event: '$event',
            date: {
              $dateToString: {
                format: groupBy === 'hour' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get summary statistics
    const summary = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate conversion rates
    const summaryObj = summary.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const impressions = summaryObj.impression || 0;
    const clicks = summaryObj.click || 0;
    const conversions = summaryObj.conversion || 0;
    const submissions = summaryObj.submission || 0;

    const stats = {
      impressions,
      clicks,
      conversions,
      submissions,
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
      conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0,
      submissionRate: impressions > 0 ? ((submissions / impressions) * 100).toFixed(2) : 0
    };

    res.json({
      analytics,
      summary: stats,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status
      }
    });
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for user
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get user's campaigns
    const campaigns = await Campaign.find({ user: req.user.id });
    const campaignIds = campaigns.map(c => c._id);

    if (campaignIds.length === 0) {
      return res.json({
        summary: {
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageCTR: 0,
          averageConversionRate: 0
        },
        chartData: [],
        topCampaigns: []
      });
    }

    // Get analytics summary
    const summary = await Analytics.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]);

    const summaryObj = summary.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalImpressions = summaryObj.impression || 0;
    const totalClicks = summaryObj.click || 0;
    const totalConversions = summaryObj.conversion || 0;

    // Get daily analytics for chart
    const chartData = await Analytics.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing campaigns
    const topCampaigns = await Analytics.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            campaign: '$campaign',
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.campaign',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      { $limit: 5 }
    ]);

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    res.json({
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalImpressions,
        totalClicks,
        totalConversions,
        averageCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
        averageConversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0
      },
      chartData,
      topCampaigns
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update campaign analytics
async function updateCampaignAnalytics(campaignId, event) {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    switch (event) {
      case 'impression':
        campaign.analytics.impressions += 1;
        break;
      case 'click':
        campaign.analytics.clicks += 1;
        break;
      case 'conversion':
        campaign.analytics.conversions += 1;
        break;
      case 'submission':
        campaign.analytics.submissions += 1;
        break;
    }

    // Recalculate rates
    if (campaign.analytics.impressions > 0) {
      campaign.analytics.ctr = (campaign.analytics.clicks / campaign.analytics.impressions) * 100;
    }
    
    if (campaign.analytics.clicks > 0) {
      campaign.analytics.conversionRate = (campaign.analytics.conversions / campaign.analytics.clicks) * 100;
    }

    await campaign.save();
  } catch (error) {
    console.error('Update campaign analytics error:', error);
  }
}

module.exports = router;