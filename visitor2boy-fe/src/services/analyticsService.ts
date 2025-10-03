import api from './api';
import { Analytics, DashboardStats, ChartData } from '../types';

export interface TrackingData {
  campaignId: string;
  event: Analytics['event'];
  sessionId: string;
  visitor?: Partial<Analytics['visitor']>;
  metadata?: Record<string, any>;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export interface DashboardAnalytics {
  summary: DashboardStats;
  chartData: ChartData[];
  topCampaigns: any[];
}

export const analyticsService = {
  // Track analytics event (public endpoint)
  trackEvent: async (data: TrackingData): Promise<void> => {
    await api.post('/analytics/track', data);
  },

  // Get campaign analytics
  getCampaignAnalytics: async (
    campaignId: string,
    filters: AnalyticsFilters = {}
  ): Promise<{
    analytics: any[];
    summary: any;
    campaign: any;
  }> => {
    const response = await api.get(`/analytics/campaigns/${campaignId}`, {
      params: filters,
    });
    return response.data;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (period: string = '30d'): Promise<DashboardAnalytics> => {
    const response = await api.get('/analytics/dashboard', {
      params: { period },
    });
    return response.data;
  },
};