const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Widget = require('../models/Widget');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin authentication' });
  }
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
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

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      'subscription.isActive': true 
    });
    const proUsers = await User.countDocuments({ 
      'subscription.plan': 'pro',
      'subscription.isActive': true 
    });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get project statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const newProjects = await Project.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get widget statistics
    const totalWidgets = await Widget.countDocuments();
    const activeWidgets = await Widget.countDocuments({ status: 'active' });
    const newWidgets = await Widget.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get analytics statistics
    const totalEvents = await Analytics.countDocuments({
      timestamp: { $gte: startDate }
    });
    const totalImpressions = await Analytics.countDocuments({
      event: 'impression',
      timestamp: { $gte: startDate }
    });
    const totalClicks = await Analytics.countDocuments({
      event: 'click',
      timestamp: { $gte: startDate }
    });
    const totalConversions = await Analytics.countDocuments({
      event: 'conversion',
      timestamp: { $gte: startDate }
    });

    // Get daily user registrations
    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing widgets
    const topWidgets = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$widget',
          impressions: {
            $sum: { $cond: [{ $eq: ['$event', 'impression'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$event', 'click'] }, 1, 0] }
          },
          conversions: {
            $sum: { $cond: [{ $eq: ['$event', 'conversion'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'widgets',
          localField: '_id',
          foreignField: '_id',
          as: 'widget'
        }
      },
      { $unwind: '$widget' },
      {
        $lookup: {
          from: 'users',
          localField: 'widget.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { impressions: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pro: proUsers,
          new: newUsers,
          conversionRate: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(2) : 0
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          new: newProjects
        },
        widgets: {
          total: totalWidgets,
          active: activeWidgets,
          new: newWidgets
        },
        analytics: {
          totalEvents,
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
          conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0
        },
        charts: {
          dailyRegistrations,
          topWidgets
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching admin dashboard' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      plan = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (plan) {
      query['subscription.plan'] = plan;
    }

    if (status === 'active') {
      query['subscription.isActive'] = true;
    } else if (status === 'inactive') {
      query['subscription.isActive'] = false;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ user: user._id });
        const widgetCount = await Widget.countDocuments({ user: user._id });
        const totalImpressions = await Analytics.countDocuments({
          user: user._id,
          event: 'impression'
        });

        return {
          ...user.toObject(),
          stats: {
            projects: projectCount,
            widgets: widgetCount,
            impressions: totalImpressions
          }
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Private (Admin only)
router.get('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's projects and widgets
    const projects = await Project.find({ user: user._id });
    const widgets = await Widget.find({ user: user._id });

    // Get analytics summary
    const analyticsData = await Analytics.aggregate([
      {
        $match: { user: user._id }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]);

    const analytics = {};
    analyticsData.forEach(item => {
      analytics[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        user: user.toObject(),
        projects,
        widgets,
        analytics
      }
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin can modify subscription, status, etc.)
// @access  Private (Admin only)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { subscription, role, isVerified } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (subscription) {
      user.subscription = { ...user.subscription, ...subscription };
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    if (typeof isVerified === 'boolean') {
      user.isVerified = isVerified;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user.toObject()
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and all associated data
// @access  Private (Admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's data
    await Analytics.deleteMany({ user: user._id });
    await Widget.deleteMany({ user: user._id });
    await Project.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend user account
// @access  Private (Admin only)
router.post('/users/:id/suspend', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription.isActive = false;
    
    // Deactivate all user's projects and widgets
    await Project.updateMany({ user: user._id }, { status: 'suspended' });
    await Widget.updateMany({ user: user._id }, { status: 'paused' });

    await user.save();

    res.json({
      success: true,
      message: 'User account suspended successfully'
    });
  } catch (error) {
    console.error('Admin suspend user error:', error);
    res.status(500).json({ message: 'Server error suspending user' });
  }
});

// @route   POST /api/admin/users/:id/reactivate
// @desc    Reactivate suspended user account
// @access  Private (Admin only)
router.post('/users/:id/reactivate', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription.isActive = true;
    
    // Reactivate user's projects and widgets
    await Project.updateMany({ user: user._id, status: 'suspended' }, { status: 'active' });
    await Widget.updateMany({ user: user._id, status: 'paused' }, { status: 'active' });

    await user.save();

    res.json({
      success: true,
      message: 'User account reactivated successfully'
    });
  } catch (error) {
    console.error('Admin reactivate user error:', error);
    res.status(500).json({ message: 'Server error reactivating user' });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get system-wide analytics overview
// @access  Private (Admin only)
router.get('/analytics/overview', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
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

    // Get analytics by event type
    const eventStats = await Analytics.aggregate([
      {
        $match: {
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

    // Get daily analytics
    const dailyAnalytics = await Analytics.aggregate([
      {
        $match: {
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

    // Get top performing users
    const topUsers = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$user',
          impressions: {
            $sum: { $cond: [{ $eq: ['$event', 'impression'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$event', 'click'] }, 1, 0] }
          },
          conversions: {
            $sum: { $cond: [{ $eq: ['$event', 'conversion'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { impressions: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        eventStats,
        dailyAnalytics,
        topUsers
      }
    });
  } catch (error) {
    console.error('Admin analytics overview error:', error);
    res.status(500).json({ message: 'Server error fetching analytics overview' });
  }
});

module.exports = router;