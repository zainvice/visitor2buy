const express = require('express');
const Project = require('../models/Project');
const Widget = require('../models/Widget');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a specific project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get widget count for this project
    const widgetCount = await Widget.countDocuments({
      project: project._id,
      status: { $ne: 'archived' }
    });

    // Get recent analytics
    const recentAnalytics = await Analytics.aggregate([
      {
        $match: {
          project: project._id,
          timestamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        widgetCount,
        recentAnalytics
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, domain, allowedDomains, settings } = req.body;

    // Validation
    if (!name || !domain) {
      return res.status(400).json({ message: 'Name and domain are required' });
    }

    // Check user's project limit
    const user = req.user;
    if (user.subscription.plan === 'free') {
      const projectCount = await Project.countDocuments({ user: user.id });
      if (projectCount >= user.subscription.limits.projects) {
        return res.status(403).json({
          message: 'Project limit reached. Upgrade to Pro for unlimited projects.'
        });
      }
    }

    // Check if domain already exists for this user
    const existingProject = await Project.findOne({
      user: req.user.id,
      domain: domain.toLowerCase()
    });

    if (existingProject) {
      return res.status(400).json({ message: 'Project with this domain already exists' });
    }

    // Create new project
    const project = new Project({
      user: req.user.id,
      name,
      description: description || '',
      domain: domain.toLowerCase(),
      allowedDomains: allowedDomains || [],
      settings: {
        ...settings,
        timezone: settings?.timezone || 'UTC',
        trackingEnabled: settings?.trackingEnabled !== false,
        gdprCompliant: settings?.gdprCompliant || false,
        cookieConsent: settings?.cookieConsent || false
      }
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, domain, allowedDomains, settings, status } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (domain) project.domain = domain.toLowerCase();
    if (allowedDomains) project.allowedDomains = allowedDomains;
    if (status) project.status = status;

    if (settings) {
      project.settings = {
        ...project.settings,
        ...settings
      };
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all widgets associated with this project
    await Widget.deleteMany({ project: project._id });

    // Delete all analytics associated with this project
    await Analytics.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Project and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
});

// @route   GET /api/projects/:id/embed-code
// @desc    Get embed code for a project
// @access  Private
router.get('/:id/embed-code', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const embedCode = `
<!-- Visitor2Buy Embed Code -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.API_URL || 'http://localhost:5000'}/scripts/${project.embedCode}.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End Visitor2Buy Embed Code -->`.trim();

    const installationInstructions = {
      html: {
        title: 'HTML Installation',
        description: 'Add this code before the closing </head> tag',
        code: embedCode
      },
      wordpress: {
        title: 'WordPress Installation',
        description: 'Add this code to your theme\'s header.php or use a plugin like "Insert Headers and Footers"',
        code: embedCode
      },
      shopify: {
        title: 'Shopify Installation',
        description: 'Go to Online Store > Themes > Actions > Edit Code, then add this to theme.liquid before </head>',
        code: embedCode
      },
      googleTagManager: {
        title: 'Google Tag Manager',
        description: 'Create a new Custom HTML tag and add this code',
        code: embedCode
      }
    };

    res.json({
      success: true,
      data: {
        embedCode,
        projectId: project._id,
        domain: project.domain,
        installationInstructions
      }
    });
  } catch (error) {
    console.error('Get embed code error:', error);
    res.status(500).json({ message: 'Server error while generating embed code' });
  }
});

// @route   POST /api/projects/:id/regenerate-keys
// @desc    Regenerate API key and embed code
// @access  Private
router.post('/:id/regenerate-keys', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Generate new keys
    project.embedCode = undefined; // Will trigger pre-save hook to generate new one
    project.apiKey = undefined;

    await project.save();

    res.json({
      success: true,
      message: 'API keys regenerated successfully',
      data: {
        embedCode: project.embedCode,
        apiKey: project.apiKey
      }
    });
  } catch (error) {
    console.error('Regenerate keys error:', error);
    res.status(500).json({ message: 'Server error while regenerating keys' });
  }
});

module.exports = router;