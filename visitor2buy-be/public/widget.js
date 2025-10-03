/**
 * Visitor2Buy Widget Script
 * Embed this script on your website to enable conversion tracking and campaigns
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'http://localhost:5000/api';
  let config = {};
  let sessionId = null;
  let activeCampaigns = [];

  // Utility functions
  function generateSessionId() {
    return 'v2b_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function getVisitorInfo() {
    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      page: window.location.href,
      device: getDeviceType(),
      browser: getBrowserName(),
      screenResolution: screen.width + 'x' + screen.height,
      timestamp: new Date().toISOString()
    };
  }

  function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  }

  function trackEvent(campaignId, event, metadata = {}) {
    const data = {
      campaignId: campaignId,
      event: event,
      sessionId: sessionId,
      visitor: getVisitorInfo(),
      metadata: metadata
    };

    // Send tracking data
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('Visitor2Buy tracking error:', error);
    });
  }

  // Campaign display functions
  function createPopup(campaign) {
    const popup = document.createElement('div');
    popup.id = `v2b-popup-${campaign._id}`;
    popup.className = 'v2b-popup';
    popup.innerHTML = `
      <div class="v2b-popup-overlay"></div>
      <div class="v2b-popup-content">
        ${campaign.settings.closeButton ? '<button class="v2b-close-btn">&times;</button>' : ''}
        <div class="v2b-popup-body">
          <h2>${campaign.content.headline}</h2>
          ${campaign.content.subheadline ? `<h3>${campaign.content.subheadline}</h3>` : ''}
          ${campaign.content.description ? `<p>${campaign.content.description}</p>` : ''}
          <button class="v2b-cta-btn" onclick="Visitor2Buy.handleCTAClick('${campaign._id}')">${campaign.content.buttonText}</button>
        </div>
      </div>
    `;

    // Apply styles
    applyPopupStyles(popup, campaign);
    
    document.body.appendChild(popup);
    
    // Track impression
    trackEvent(campaign._id, 'impression');
    
    // Add event listeners
    if (campaign.settings.closeButton) {
      popup.querySelector('.v2b-close-btn').addEventListener('click', () => {
        closePopup(campaign._id);
      });
    }

    // Auto-close after delay if specified
    if (campaign.settings.autoClose) {
      setTimeout(() => {
        closePopup(campaign._id);
      }, campaign.settings.autoCloseDelay || 10000);
    }

    return popup;
  }

  function applyPopupStyles(popup, campaign) {
    const styles = `
      .v2b-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .v2b-popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }
      .v2b-popup-content {
        position: relative;
        background: ${campaign.design.colors.background || '#ffffff'};
        color: ${campaign.design.colors.text || '#333333'};
        padding: 30px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        text-align: center;
      }
      .v2b-close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: ${campaign.design.colors.text || '#333333'};
      }
      .v2b-popup-body h2 {
        margin: 0 0 10px 0;
        color: ${campaign.design.colors.primary || '#1976d2'};
        font-size: 24px;
      }
      .v2b-popup-body h3 {
        margin: 0 0 15px 0;
        color: ${campaign.design.colors.secondary || '#666666'};
        font-size: 18px;
        font-weight: normal;
      }
      .v2b-popup-body p {
        margin: 0 0 20px 0;
        line-height: 1.5;
      }
      .v2b-cta-btn {
        background: ${campaign.design.colors.primary || '#1976d2'};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
      }
      .v2b-cta-btn:hover {
        opacity: 0.9;
      }
    `;

    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  function closePopup(campaignId) {
    const popup = document.getElementById(`v2b-popup-${campaignId}`);
    if (popup) {
      popup.remove();
      trackEvent(campaignId, 'close');
    }
  }

  function shouldShowCampaign(campaign) {
    // Check device targeting
    const currentDevice = getDeviceType();
    if (campaign.targeting.devices && !campaign.targeting.devices.includes(currentDevice)) {
      return false;
    }

    // Check page targeting
    if (campaign.targeting.pages && campaign.targeting.pages.length > 0) {
      const currentPage = window.location.pathname;
      const matches = campaign.targeting.pages.some(page => {
        return currentPage.includes(page) || new RegExp(page).test(currentPage);
      });
      if (!matches) return false;
    }

    // Check referrer targeting
    if (campaign.targeting.referrers && campaign.targeting.referrers.length > 0) {
      const referrer = document.referrer;
      const matches = campaign.targeting.referrers.some(ref => {
        return referrer.includes(ref);
      });
      if (!matches) return false;
    }

    // Check time targeting
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    if (campaign.schedule.daysOfWeek && !campaign.schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Add more targeting logic as needed

    return true;
  }

  // Main Visitor2Buy object
  window.Visitor2Buy = {
    init: function(userConfig) {
      config = Object.assign({
        apiUrl: API_BASE_URL,
        debug: false
      }, userConfig);

      sessionId = generateSessionId();
      
      if (config.debug) {
        console.log('Visitor2Buy initialized with session:', sessionId);
      }

      // Load and display campaigns
      this.loadCampaigns();
    },

    loadCampaigns: function() {
      // In a real implementation, this would fetch active campaigns from the API
      // For now, we'll simulate with the campaigns passed in config
      if (config.campaigns) {
        activeCampaigns = config.campaigns;
        this.processCampaigns();
      }
    },

    processCampaigns: function() {
      activeCampaigns.forEach(campaign => {
        if (shouldShowCampaign(campaign)) {
          // Apply delay if specified
          const delay = campaign.settings.delay || 0;
          setTimeout(() => {
            this.displayCampaign(campaign);
          }, delay * 1000);
        }
      });
    },

    displayCampaign: function(campaign) {
      switch (campaign.type) {
        case 'popup':
        case 'modal':
          createPopup(campaign);
          break;
        case 'banner':
          // Implement banner display
          break;
        case 'slide-in':
          // Implement slide-in display
          break;
        default:
          console.warn('Unsupported campaign type:', campaign.type);
      }
    },

    handleCTAClick: function(campaignId) {
      trackEvent(campaignId, 'click');
      
      const campaign = activeCampaigns.find(c => c._id === campaignId);
      if (campaign && campaign.content.buttonLink) {
        if (campaign.content.buttonLink.startsWith('http')) {
          window.open(campaign.content.buttonLink, '_blank');
        } else {
          window.location.href = campaign.content.buttonLink;
        }
      }
    },

    track: function(event, campaignId, metadata) {
      trackEvent(campaignId, event, metadata);
    },

    submitForm: function(formData, campaignId) {
      const data = Object.assign({
        campaignId: campaignId,
        visitor: getVisitorInfo()
      }, formData);

      fetch(`${API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        trackEvent(campaignId, 'submission', { contactId: result.contactId });
        if (config.onFormSubmit) {
          config.onFormSubmit(result);
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);
      });
    }
  };

  // Auto-initialize if config is provided
  if (window.Visitor2BuyConfig) {
    window.Visitor2Buy.init(window.Visitor2BuyConfig);
  }

})();