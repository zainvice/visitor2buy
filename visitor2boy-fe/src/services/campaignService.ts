import api from './api';
import { Campaign, PaginatedResponse } from '../types';

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  type: Campaign['type'];
  targeting?: Partial<Campaign['targeting']>;
  design?: Partial<Campaign['design']>;
  content: Partial<Campaign['content']>;
  schedule?: Partial<Campaign['schedule']>;
  settings?: Partial<Campaign['settings']>;
}

export const campaignService = {
  // Get all campaigns
  getCampaigns: async (filters: CampaignFilters = {}): Promise<PaginatedResponse<Campaign>> => {
    const response = await api.get('/campaigns', { params: filters });
    return {
      data: response.data.campaigns,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      total: response.data.total,
    };
  },

  // Get campaign by ID
  getCampaign: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data.campaign;
  },

  // Create new campaign
  createCampaign: async (campaignData: CreateCampaignData): Promise<Campaign> => {
    const response = await api.post('/campaigns', campaignData);
    return response.data.campaign;
  },

  // Update campaign
  updateCampaign: async (id: string, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data.campaign;
  },

  // Delete campaign
  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  // Duplicate campaign
  duplicateCampaign: async (id: string): Promise<Campaign> => {
    const response = await api.post(`/campaigns/${id}/duplicate`);
    return response.data.campaign;
  },

  // Toggle campaign status
  toggleCampaignStatus: async (id: string): Promise<Campaign> => {
    const response = await api.post(`/campaigns/${id}/toggle-status`);
    return response.data.campaign;
  },

  // Get campaign preview
  getCampaignPreview: async (id: string): Promise<any> => {
    const response = await api.get(`/campaigns/${id}/preview`);
    return response.data.preview;
  },
};