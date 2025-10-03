const express = require('express');
const Widget = require('../models/Widget');
const Project = require('../models/Project');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/widgets
// @desc    Get all widgets for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { project, status, type, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (project) query.project = project;
    if (status) query.status = status;
    if (type) query.type = type;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const widgets = await Widget.find(query)
      .populate('project', 'name domain')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Widget.countDocuments(query);

    res.json({
      success: true,
      data: widgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get widgets error:', error);
    res.status(500).json({ message: 'Server error while fetching widgets' });
  }
});

// @route   GET /api/widgets/:id
// @desc    Get a specific widget
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const widget = await Widget.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('project', 'name domain embedCode');

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Get analytics summary for this widget
    const analyticsData = await Analytics.aggregate([
      {
        $match: {
          widget: widget._id,
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

    const analytics = {};
    analyticsData.forEach(item => {
      analytics[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        ...widget.toObject(),
        analytics
      }
    });
  } catch (error) {
    console.error('Get widget error:', error);
    res.status(500).json({ message: 'Server error while fetching widget' });
  }
});

// @route   POST /api/widgets
// @desc    Create a new widget
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      project,
      name,
      description,
      type,
      targeting,
      design,
      content,
      triggers,
      settings,
      schedule
    } = req.body;

    // Validation
    if (!project || !name || !type) {
      return res.status(400).json({ message: 'Project, name, and type are required' });
    }

    if (!content || !content.headline) {
      return res.status(400).json({ message: 'Content headline is required' });
    }

    // Verify project belongs to user
    const projectDoc = await Project.findOne({
      _id: project,
      user: req.user.id
    });

    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check user's widget limit
    const user = req.user;
    if (user.subscription.plan === 'free') {
      const widgetCount = await Widget.countDocuments({ 
        user: user.id,
        status: { $ne: 'archived' }
      });
      
      if (widgetCount >= user.subscription.limits.widgets) {
        return res.status(403).json({
          message: 'Widget limit reached. Upgrade to Pro for unlimited widgets.'
        });
      }
    }

    // Create new widget
    const widget = new Widget({
      user: req.user.id,
      project,
      name,
      description: description || '',
      type,
      targeting: targeting || {},
      design: design || {},
      content,
      triggers: triggers || {},
      settings: settings || {},
      schedule: schedule || {}
    });

    await widget.save();

    // Populate project info
    await widget.populate('project', 'name domain');

    res.status(201).json({
      success: true,
      message: 'Widget created successfully',
      data: widget
    });
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({ message: 'Server error while creating widget' });
  }
});

// @route   PUT /api/widgets/:id
// @desc    Update a widget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      status,
      targeting,
      design,
      content,
      triggers,
      settings,
      schedule
    } = req.body;

    const widget = await Widget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Update fields
    if (name) widget.name = name;
    if (description !== undefined) widget.description = description;
    if (type) widget.type = type;
    if (status) widget.status = status;

    if (targeting) {
      widget.targeting = { ...widget.targeting, ...targeting };
    }

    if (design) {
      widget.design = { ...widget.design, ...design };
    }

    if (content) {
      widget.content = { ...widget.content, ...content };
    }

    if (triggers) {
      widget.triggers = { ...widget.triggers, ...triggers };
    }

    if (settings) {
      widget.settings = { ...widget.settings, ...settings };
    }

    if (schedule) {
      widget.schedule = { ...widget.schedule, ...schedule };
    }

    await widget.save();

    res.json({
      success: true,
      message: 'Widget updated successfully',
      data: widget
    });
  } catch (error) {
    console.error('Update widget error:', error);
    res.status(500).json({ message: 'Server error while updating widget' });
  }
});

// @route   DELETE /api/widgets/:id
// @desc    Delete a widget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const widget = await Widget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Delete all analytics associated with this widget
    await Analytics.deleteMany({ widget: widget._id });

    // Delete the widget
    await Widget.findByIdAndDelete(widget._id);

    res.json({
      success: true,
      message: 'Widget and all associated analytics deleted successfully'
    });
  } catch (error) {
    console.error('Delete widget error:', error);
    res.status(500).json({ message: 'Server error while deleting widget' });
  }
});

// @route   POST /api/widgets/:id/duplicate
// @desc    Duplicate a widget
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalWidget = await Widget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!originalWidget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Check user's widget limit
    const user = req.user;
    if (user.subscription.plan === 'free') {
      const widgetCount = await Widget.countDocuments({ 
        user: user.id,
        status: { $ne: 'archived' }
      });
      
      if (widgetCount >= user.subscription.limits.widgets) {
        return res.status(403).json({
          message: 'Widget limit reached. Upgrade to Pro for unlimited widgets.'
        });
      }
    }

    // Create duplicate
    const duplicateWidget = new Widget({
      ...originalWidget.toObject(),
      _id: undefined,
      name: `${originalWidget.name} (Copy)`,
      status: 'draft',
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        submissions: 0,
        closes: 0,
        ctr: 0,
        conversionRate: 0
      },
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicateWidget.save();
    await duplicateWidget.populate('project', 'name domain');

    res.status(201).json({
      success: true,
      message: 'Widget duplicated successfully',
      data: duplicateWidget
    });
  } catch (error) {
    console.error('Duplicate widget error:', error);
    res.status(500).json({ message: 'Server error while duplicating widget' });
  }
});

// @route   GET /api/widgets/:id/preview
// @desc    Get widget preview data
// @access  Private
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const widget = await Widget.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('project', 'name domain branding');

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Generate preview HTML/CSS/JS
    const previewData = {
      widget: widget.toObject(),
      html: generateWidgetHTML(widget),
      css: generateWidgetCSS(widget),
      js: generateWidgetJS(widget)
    };

    res.json({
      success: true,
      data: previewData
    });
  } catch (error) {
    console.error('Widget preview error:', error);
    res.status(500).json({ message: 'Server error while generating preview' });
  }
});

// Helper function to generate widget HTML
function generateWidgetHTML(widget) {
  const { content, design, type } = widget;
  
  let html = `<div id="visitor2buy-widget-${widget._id}" class="visitor2buy-widget visitor2buy-${type}">`;
  
  if (design.closeButton?.enabled) {
    html += `<button class="visitor2buy-close" onclick="closeWidget('${widget._id}')">&times;</button>`;
  }
  
  if (content.images && content.images.length > 0) {
    content.images.forEach(img => {
      html += `<img src="${img.url}" alt="${img.alt || ''}" class="visitor2buy-image">`;
    });
  }
  
  html += `<h2 class="visitor2buy-headline">${content.headline}</h2>`;
  
  if (content.subheadline) {
    html += `<h3 class="visitor2buy-subheadline">${content.subheadline}</h3>`;
  }
  
  if (content.description) {
    html += `<p class="visitor2buy-description">${content.description}</p>`;
  }
  
  if (content.buttons && content.buttons.length > 0) {
    content.buttons.forEach((button, index) => {
      html += `<button class="visitor2buy-button visitor2buy-button-${button.style}" 
                      onclick="handleButtonClick('${widget._id}', ${index})">${button.text}</button>`;
    });
  }
  
  if (content.form?.enabled) {
    html += generateFormHTML(content.form, widget._id);
  }
  
  html += '</div>';
  
  if (design.overlay?.enabled) {
    html = `<div class="visitor2buy-overlay" onclick="closeWidget('${widget._id}')">${html}</div>`;
  }
  
  return html;
}

// Helper function to generate widget CSS
function generateWidgetCSS(widget) {
  const { design } = widget;
  
  return `
    .visitor2buy-widget {
      position: ${widget.type === 'floating-button' ? 'fixed' : 'relative'};
      background: ${design.colors?.background || '#ffffff'};
      color: ${design.colors?.text || '#333333'};
      font-family: ${design.typography?.fontFamily || 'Arial, sans-serif'};
      font-size: ${design.typography?.fontSize || '16px'};
      padding: ${design.spacing?.padding || '20px'};
      border-radius: ${design.spacing?.borderRadius || '8px'};
      box-shadow: ${design.effects?.shadow || '0 4px 6px rgba(0, 0, 0, 0.1)'};
      max-width: ${design.size?.width || '400px'};
      z-index: 10000;
    }
    
    .visitor2buy-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${design.overlay?.color || 'rgba(0, 0, 0, 0.5)'};
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .visitor2buy-headline {
      color: ${design.colors?.primary || '#007bff'};
      margin: 0 0 10px 0;
    }
    
    .visitor2buy-button {
      background: ${design.colors?.primary || '#007bff'};
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    
    .visitor2buy-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    
    ${design.customCSS || ''}
  `;
}

// Helper function to generate widget JS
function generateWidgetJS(widget) {
  return `
    function closeWidget(widgetId) {
      const element = document.getElementById('visitor2buy-widget-' + widgetId);
      if (element) {
        element.style.display = 'none';
      }
      // Track close event
      trackEvent(widgetId, 'close');
    }
    
    function handleButtonClick(widgetId, buttonIndex) {
      // Track click event
      trackEvent(widgetId, 'click');
      
      // Handle button action
      const widget = ${JSON.stringify(widget)};
      const button = widget.content.buttons[buttonIndex];
      
      if (button.action === 'url' && button.value) {
        window.open(button.value, '_blank');
      } else if (button.action === 'close') {
        closeWidget(widgetId);
      }
    }
    
    function trackEvent(widgetId, event) {
      fetch('${process.env.API_URL || 'http://localhost:5000'}/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetId: widgetId,
          event: event,
          timestamp: new Date().toISOString()
        })
      });
    }
  `;
}

// Helper function to generate form HTML
function generateFormHTML(form, widgetId) {
  let html = `<form class="visitor2buy-form" onsubmit="submitForm(event, '${widgetId}')">`;
  
  form.fields.forEach(field => {
    html += `<div class="visitor2buy-field">`;
    html += `<label>${field.label}</label>`;
    
    if (field.type === 'select') {
      html += `<select name="${field.name}" ${field.required ? 'required' : ''}>`;
      field.options.forEach(option => {
        html += `<option value="${option}">${option}</option>`;
      });
      html += `</select>`;
    } else if (field.type === 'textarea') {
      html += `<textarea name="${field.name}" placeholder="${field.placeholder || ''}" 
                         ${field.required ? 'required' : ''}></textarea>`;
    } else {
      html += `<input type="${field.type}" name="${field.name}" 
                      placeholder="${field.placeholder || ''}" 
                      ${field.required ? 'required' : ''}>`;
    }
    
    html += `</div>`;
  });
  
  html += `<button type="submit" class="visitor2buy-button">${form.submitText}</button>`;
  html += `</form>`;
  
  return html;
}

module.exports = router;