export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  company?: string;
  website?: string;
  phone?: string;
  isVerified: boolean;
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    startDate: string;
    endDate?: string;
    isActive: boolean;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  user: string;
  name: string;
  description?: string;
  type: 'popup' | 'banner' | 'slide-in' | 'bar' | 'modal' | 'widget';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targeting: {
    countries: string[];
    devices: ('desktop' | 'mobile' | 'tablet')[];
    browsers: string[];
    referrers: string[];
    pages: string[];
    timeOnSite: {
      min: number;
      max: number;
    };
    visitCount: {
      min: number;
      max: number;
    };
    scrollPercentage: number;
  };
  design: {
    template: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    images: Array<{
      url: string;
      alt: string;
      position: string;
    }>;
    customCSS: string;
  };
  content: {
    headline: string;
    subheadline: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    formFields: Array<{
      type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
    }>;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
    daysOfWeek: number[];
    timeRange: {
      start: string;
      end: string;
    };
  };
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    submissions: number;
    ctr: number;
    conversionRate: number;
  };
  settings: {
    frequency: 'once' | 'daily' | 'session';
    delay: number;
    closeButton: boolean;
    overlay: boolean;
    sound: boolean;
    animation: 'fade' | 'slide' | 'bounce' | 'zoom';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  campaign?: string;
  user: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  formData: Record<string, any>;
  source: 'campaign' | 'contact-form' | 'api';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags: string[];
  notes: Array<{
    content: string;
    addedBy: string;
    addedAt: string;
  }>;
  visitor: {
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    referrer?: string;
    page?: string;
  };
  isSubscribed: boolean;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  _id: string;
  campaign: string;
  user: string;
  event: 'impression' | 'click' | 'conversion' | 'submission' | 'close';
  visitor: {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    referrer?: string;
    page?: string;
  };
  metadata: Record<string, any>;
  timestamp: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
}

export interface ChartData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}