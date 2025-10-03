const express = require('express');
const Analytics = require('../models/Analytics');
const Widget = require('../models/Widget');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track analytics event
// @access  Public (for tracking widgets)
router.post('/track', async (req, res) => {
  try {
    const {
      widgetId,
      projectId,
      event,
      sessionId,
      visitor,
      metadata,
      formData,
      value
    } = req.body;

    // Validate required fields
    if (!widgetId || !projectId || !event || !sessionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find widget and project
    const widget = await Widget.findById(widgetId);
    const project = await Project.findById(projectId);
    
    if (!widget || !project) {
      return res.status(404).json({ message: 'Widget or project not found' });
    }

    // Create analytics record
    const analyticsRecord = new Analytics({
      widget: widgetId,
      project: projectId,
      user: widget.user,
      event,
      visitor: {
        sessionId,
        ...visitor
      },
      metadata: metadata || {},
      formData: formData || {},
      value: value || 0
    });

    await analyticsRecord.save();

    // Update widget and project analytics
    await updateWidgetAnalytics(widgetId, event);
    await updateProjectAnalytics(projectId, event);

    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ message: 'Server error during tracking' });
  }
});

// @route   GET /api/analytics/widgets/:id
// @desc    Get analytics for specific widget
// @access  Private
router.get('/widgets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Verify widget ownership
    const widget = await Widget.findOne({
      _id: id,
      user: req.user.id
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      widget: widget._id
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
      widget: {
        id: widget._id,
        name: widget.name,
        type: widget.type,
        status: widget.status
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

    // Get user's widgets
    const widgets = await Widget.find({ user: req.user.id });
    const widgetIds = widgets.map(w => w._id);

    if (widgetIds.length === 0) {
      return res.json({
        summary: {
          totalWidgets: 0,
          activeWidgets: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageCTR: 0,
          averageConversionRate: 0
        },
        chartData: [],
        topWidgets: []
      });
    }

    // Get analytics summary
    const summary = await Analytics.aggregate([
      {
        $match: {
          widget: { $in: widgetIds },
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

// Helper function to update widget analytics
async function updateWidgetAnalytics(widgetId, event) {
  try {
    const widget = await Widget.findById(widgetId);
    if (!widget) return;

    const updateField = `analytics.${event}s`;
    await Widget.findByIdAndUpdate(widgetId, {
      $inc: { [updateField]: 1 },
      'analytics.lastShown': new Date()
    });
  } catch (error) {
    console.error('Update widget analytics error:', error);
  }
}

// Helper function to update project analytics
async function updateProjectAnalytics(projectId, event) {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const updateField = `analytics.total${event.charAt(0).toUpperCase() + event.slice(1)}s`;
    await Project.findByIdAndUpdate(projectId, {
      $inc: { [updateField]: 1 },
      'analytics.lastActivity': new Date()
    });
  } catch (error) {
    console.error('Update project analytics error:', error);
  }
}

module.exports = router;