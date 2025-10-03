const express = require('express');
const Project = require('../models/Project');
const Widget = require('../models/Widget');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @route   GET /scripts/:embedCode.js
// @desc    Serve the embed script for a project
// @access  Public
router.get('/scripts/:embedCode.js', async (req, res) => {
  try {
    const { embedCode } = req.params;

    // Find project by embed code
    const project = await Project.findOne({ embedCode, status: 'active' });
    if (!project) {
      return res.status(404).send('// Project not found or inactive');
    }

    // Get active widgets for this project
    const widgets = await Widget.find({
      project: project._id,
      status: 'active',
      $or: [
        { 'schedule.startDate': { $lte: new Date() } },
        { 'schedule.startDate': { $exists: false } }
      ],
      $or: [
        { 'schedule.endDate': { $gte: new Date() } },
        { 'schedule.endDate': { $exists: false } }
      ]
    });

    // Generate the embed script
    const embedScript = generateEmbedScript(project, widgets);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    res.send(embedScript);
  } catch (error) {
    console.error('Embed script error:', error);
    res.status(500).send('// Error loading widgets');
  }
});

// @route   GET /api/embed/widgets/:projectId
// @desc    Get widgets configuration for a project (JSON API)
// @access  Public
router.get('/widgets/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { domain } = req.query;

    // Find project
    const project = await Project.findOne({ 
      _id: projectId, 
      status: 'active' 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify domain if provided
    if (domain && !isAllowedDomain(domain, project)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Get active widgets with targeting
    const widgets = await Widget.find({
      project: project._id,
      status: 'active'
    });

    // Filter widgets based on current context
    const filteredWidgets = widgets.filter(widget => {
      return shouldShowWidget(widget, req);
    });

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        domain: project.domain,
        branding: project.branding
      },
      widgets: filteredWidgets.map(widget => ({
        id: widget._id,
        type: widget.type,
        design: widget.design,
        content: widget.content,
        triggers: widget.triggers,
        settings: widget.settings,
        targeting: widget.targeting
      }))
    });
  } catch (error) {
    console.error('Get widgets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/embed/track
// @desc    Track widget events (public endpoint)
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const {
      widgetId,
      projectId,
      event,
      sessionId,
      metadata = {},
      formData = {},
      value = 0
    } = req.body;

    // Validation
    if (!widgetId || !projectId || !event || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify widget and project exist
    const widget = await Widget.findById(widgetId);
    const project = await Project.findById(projectId);

    if (!widget || !project) {
      return res.status(404).json({ error: 'Widget or project not found' });
    }

    // Extract visitor info from request
    const visitorInfo = {
      sessionId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      page: metadata.page || req.get('Referer')
    };

    // Detect device type
    const userAgent = visitorInfo.userAgent || '';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      visitorInfo.device = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    } else {
      visitorInfo.device = 'desktop';
    }

    // Create analytics record
    const analyticsRecord = new Analytics({
      widget: widgetId,
      project: projectId,
      user: widget.user,
      event,
      visitor: visitorInfo,
      metadata,
      value,
      formData
    });

    await analyticsRecord.save();

    // Update widget analytics counters
    const updateField = `analytics.${event}s`;
    await Widget.findByIdAndUpdate(widgetId, {
      $inc: { [updateField]: 1 },
      'analytics.lastShown': new Date()
    });

    // Update project analytics counters
    const projectUpdateField = `analytics.total${event.charAt(0).toUpperCase() + event.slice(1)}s`;
    await Project.findByIdAndUpdate(projectId, {
      $inc: { [projectUpdateField]: 1 },
      'analytics.lastActivity': new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate the embed script
function generateEmbedScript(project, widgets) {
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  
  return `
(function() {
  'use strict';
  
  // Visitor2Buy Widget Loader
  var V2B = {
    projectId: '${project._id}',
    embedCode: '${project.embedCode}',
    apiUrl: '${apiUrl}',
    widgets: ${JSON.stringify(widgets)},
    sessionId: null,
    loadedWidgets: {},
    
    init: function() {
      this.sessionId = this.getOrCreateSessionId();
      this.loadCSS();
      this.processWidgets();
    },
    
    getOrCreateSessionId: function() {
      var sessionId = localStorage.getItem('v2b_session_id');
      if (!sessionId) {
        sessionId = 'v2b_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('v2b_session_id', sessionId);
      }
      return sessionId;
    },
    
    loadCSS: function() {
      if (document.getElementById('v2b-styles')) return;
      
      var css = \`
        .v2b-widget {
          position: fixed;
          z-index: 10000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }
        
        .v2b-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .v2b-popup {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
          position: relative;
        }
        
        .v2b-close {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        
        .v2b-close:hover {
          color: #333;
        }
        
        .v2b-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
          font-size: 14px;
        }
        
        .v2b-button:hover {
          background: #0056b3;
        }
        
        .v2b-form {
          margin-top: 15px;
        }
        
        .v2b-field {
          margin-bottom: 15px;
        }
        
        .v2b-field label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .v2b-field input,
        .v2b-field select,
        .v2b-field textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .v2b-floating-button {
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .v2b-banner {
          top: 0;
          left: 0;
          width: 100%;
          background: #007bff;
          color: white;
          padding: 10px;
          text-align: center;
        }
        
        .v2b-notification-bar {
          bottom: 0;
          left: 0;
          width: 100%;
          background: #28a745;
          color: white;
          padding: 10px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .v2b-popup {
            max-width: 95%;
            margin: 10px;
          }
        }
      \`;
      
      var style = document.createElement('style');
      style.id = 'v2b-styles';
      style.textContent = css;
      document.head.appendChild(style);
    },
    
    processWidgets: function() {
      var self = this;
      this.widgets.forEach(function(widget) {
        if (self.shouldShowWidget(widget)) {
          self.scheduleWidget(widget);
        }
      });
    },
    
    shouldShowWidget: function(widget) {
      // Check if already shown based on frequency
      var cookieName = 'v2b_shown_' + widget._id;
      var lastShown = localStorage.getItem(cookieName);
      
      if (widget.triggers.frequency === 'once' && lastShown) {
        return false;
      }
      
      if (widget.triggers.frequency === 'daily' && lastShown) {
        var daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSince < 1) return false;
      }
      
      // Check device targeting
      if (widget.targeting.devices && widget.targeting.devices.length > 0) {
        var currentDevice = this.getDeviceType();
        if (widget.targeting.devices.indexOf(currentDevice) === -1) {
          return false;
        }
      }
      
      // Check page targeting
      if (widget.targeting.pages) {
        var currentUrl = window.location.href;
        var currentPath = window.location.pathname;
        
        // Check include patterns
        if (widget.targeting.pages.include && widget.targeting.pages.include.length > 0) {
          var matches = widget.targeting.pages.include.some(function(pattern) {
            return currentUrl.includes(pattern) || currentPath.includes(pattern);
          });
          if (!matches) return false;
        }
        
        // Check exclude patterns
        if (widget.targeting.pages.exclude && widget.targeting.pages.exclude.length > 0) {
          var excluded = widget.targeting.pages.exclude.some(function(pattern) {
            return currentUrl.includes(pattern) || currentPath.includes(pattern);
          });
          if (excluded) return false;
        }
      }
      
      return true;
    },
    
    scheduleWidget: function(widget) {
      var self = this;
      var delay = (widget.triggers.delay || 0) * 1000;
      
      setTimeout(function() {
        self.showWidget(widget);
      }, delay);
      
      // Set up scroll trigger if configured
      if (widget.targeting.scrollPercentage > 0) {
        this.setupScrollTrigger(widget);
      }
      
      // Set up exit intent if configured
      if (widget.targeting.exitIntent) {
        this.setupExitIntent(widget);
      }
    },
    
    setupScrollTrigger: function(widget) {
      var self = this;
      var triggered = false;
      
      function checkScroll() {
        if (triggered) return;
        
        var scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= widget.targeting.scrollPercentage) {
          triggered = true;
          self.showWidget(widget);
          window.removeEventListener('scroll', checkScroll);
        }
      }
      
      window.addEventListener('scroll', checkScroll);
    },
    
    setupExitIntent: function(widget) {
      var self = this;
      var triggered = false;
      
      function handleMouseLeave(e) {
        if (triggered || e.clientY > 0) return;
        
        triggered = true;
        self.showWidget(widget);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      document.addEventListener('mouseleave', handleMouseLeave);
    },
    
    showWidget: function(widget) {
      if (this.loadedWidgets[widget._id]) return;
      
      this.loadedWidgets[widget._id] = true;
      this.trackEvent(widget._id, 'impression');
      
      var element = this.createWidgetElement(widget);
      document.body.appendChild(element);
      
      // Mark as shown
      var cookieName = 'v2b_shown_' + widget._id;
      localStorage.setItem(cookieName, Date.now().toString());
    },
    
    createWidgetElement: function(widget) {
      var container = document.createElement('div');
      container.id = 'v2b-widget-' + widget._id;
      container.className = 'v2b-widget v2b-' + widget.type;
      
      var html = this.generateWidgetHTML(widget);
      container.innerHTML = html;
      
      // Apply custom styles
      if (widget.design.customCSS) {
        var style = document.createElement('style');
        style.textContent = widget.design.customCSS;
        container.appendChild(style);
      }
      
      // Set up event listeners
      this.setupWidgetEvents(container, widget);
      
      return container;
    },
    
    generateWidgetHTML: function(widget) {
      var content = widget.content;
      var design = widget.design;
      
      var html = '';
      
      if (widget.type === 'popup') {
        html += '<div class="v2b-overlay" onclick="V2B.closeWidget(\'' + widget._id + '\')">';
        html += '<div class="v2b-popup" onclick="event.stopPropagation()">';
      }
      
      if (widget.settings.closeButton && widget.settings.closeButton.enabled) {
        html += '<button class="v2b-close" onclick="V2B.closeWidget(\'' + widget._id + '\')">&times;</button>';
      }
      
      if (content.images && content.images.length > 0) {
        content.images.forEach(function(img) {
          html += '<img src="' + img.url + '" alt="' + (img.alt || '') + '" style="max-width: 100%; height: auto;">';
        });
      }
      
      html += '<h2 style="color: ' + (design.colors.primary || '#007bff') + '; margin: 0 0 10px 0;">' + content.headline + '</h2>';
      
      if (content.subheadline) {
        html += '<h3 style="margin: 0 0 10px 0;">' + content.subheadline + '</h3>';
      }
      
      if (content.description) {
        html += '<p style="margin: 0 0 15px 0;">' + content.description + '</p>';
      }
      
      if (content.buttons && content.buttons.length > 0) {
        content.buttons.forEach(function(button, index) {
          html += '<button class="v2b-button" onclick="V2B.handleButtonClick(\'' + widget._id + '\', ' + index + ')">' + button.text + '</button>';
        });
      }
      
      if (content.form && content.form.enabled) {
        html += this.generateFormHTML(content.form, widget._id);
      }
      
      if (widget.type === 'popup') {
        html += '</div></div>';
      }
      
      return html;
    },
    
    generateFormHTML: function(form, widgetId) {
      var html = '<form class="v2b-form" onsubmit="V2B.submitForm(event, \'' + widgetId + '\')">';
      
      form.fields.forEach(function(field) {
        html += '<div class="v2b-field">';
        html += '<label>' + field.label + '</label>';
        
        if (field.type === 'select') {
          html += '<select name="' + field.name + '" ' + (field.required ? 'required' : '') + '>';
          field.options.forEach(function(option) {
            html += '<option value="' + option + '">' + option + '</option>';
          });
          html += '</select>';
        } else if (field.type === 'textarea') {
          html += '<textarea name="' + field.name + '" placeholder="' + (field.placeholder || '') + '" ' + (field.required ? 'required' : '') + '></textarea>';
        } else {
          html += '<input type="' + field.type + '" name="' + field.name + '" placeholder="' + (field.placeholder || '') + '" ' + (field.required ? 'required' : '') + '>';
        }
        
        html += '</div>';
      });
      
      html += '<button type="submit" class="v2b-button">' + form.submitText + '</button>';
      html += '</form>';
      
      return html;
    },
    
    setupWidgetEvents: function(container, widget) {
      // Track clicks on the widget
      container.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('v2b-close')) {
          V2B.trackEvent(widget._id, 'click');
        }
      });
    },
    
    handleButtonClick: function(widgetId, buttonIndex) {
      var widget = this.widgets.find(function(w) { return w._id === widgetId; });
      if (!widget) return;
      
      var button = widget.content.buttons[buttonIndex];
      
      if (button.action === 'url' && button.value) {
        window.open(button.value, '_blank');
      } else if (button.action === 'close') {
        this.closeWidget(widgetId);
      } else if (button.action === 'phone' && button.value) {
        window.location.href = 'tel:' + button.value;
      } else if (button.action === 'email' && button.value) {
        window.location.href = 'mailto:' + button.value;
      }
    },
    
    submitForm: function(event, widgetId) {
      event.preventDefault();
      
      var form = event.target;
      var formData = new FormData(form);
      var data = {};
      
      for (var pair of formData.entries()) {
        data[pair[0]] = pair[1];
      }
      
      this.trackEvent(widgetId, 'submission', data);
      
      // Show success message or redirect
      var widget = this.widgets.find(function(w) { return w._id === widgetId; });
      if (widget && widget.content.form.successMessage) {
        alert(widget.content.form.successMessage);
      }
      
      if (widget && widget.content.form.redirectUrl) {
        window.location.href = widget.content.form.redirectUrl;
      } else {
        this.closeWidget(widgetId);
      }
    },
    
    closeWidget: function(widgetId) {
      var element = document.getElementById('v2b-widget-' + widgetId);
      if (element) {
        element.remove();
        this.trackEvent(widgetId, 'close');
      }
    },
    
    trackEvent: function(widgetId, event, formData) {
      var data = {
        widgetId: widgetId,
        projectId: this.projectId,
        event: event,
        sessionId: this.sessionId,
        metadata: {
          page: window.location.href,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        }
      };
      
      if (formData) {
        data.formData = formData;
      }
      
      fetch(this.apiUrl + '/api/embed/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(function(error) {
        console.error('V2B tracking error:', error);
      });
    },
    
    getDeviceType: function() {
      var userAgent = navigator.userAgent;
      if (/iPad/.test(userAgent)) return 'tablet';
      if (/Mobile|Android|iPhone/.test(userAgent)) return 'mobile';
      return 'desktop';
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      V2B.init();
    });
  } else {
    V2B.init();
  }
  
  // Expose V2B globally for debugging
  window.V2B = V2B;
})();
  `;
}

// Helper function to check if domain is allowed
function isAllowedDomain(domain, project) {
  const allowedDomains = [project.domain, ...project.allowedDomains];
  return allowedDomains.some(allowed => {
    if (allowed.startsWith('*.')) {
      const baseDomain = allowed.substring(2);
      return domain.endsWith(baseDomain);
    }
    return domain === allowed || domain.endsWith('.' + allowed);
  });
}

// Helper function to determine if widget should be shown
function shouldShowWidget(widget, req) {
  const now = new Date();
  
  // Check schedule
  if (widget.schedule.startDate && widget.schedule.startDate > now) {
    return false;
  }
  
  if (widget.schedule.endDate && widget.schedule.endDate < now) {
    return false;
  }
  
  // Check day of week
  const currentDay = now.getDay();
  if (widget.schedule.daysOfWeek && !widget.schedule.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  // Check time range
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  if (widget.schedule.timeRange) {
    if (currentTime < widget.schedule.timeRange.start || 
        currentTime > widget.schedule.timeRange.end) {
      return false;
    }
  }
  
  return true;
}

module.exports = router;