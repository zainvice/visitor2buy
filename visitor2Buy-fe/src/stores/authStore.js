import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      // Initialize auth from localStorage
      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            set({ isLoading: true });
            const response = await api.get('/auth/me');
            set({ 
              user: response.data.user, 
              token,
              isLoading: false,
              isInitialized: true 
            });
          } catch (error) {
            console.error('Auth initialization failed:', error);
            localStorage.removeItem('token');
            set({ 
              user: null, 
              token: null, 
              isLoading: false,
              isInitialized: true 
            });
          }
        } else {
          set({ isInitialized: true, isLoading: false });
        }
      },

      // Login
      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/login', credentials);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          return { success: false, message };
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          return { success: false, message };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      // Forgot Password
      forgotPassword: async (email) => {
        try {
          set({ isLoading: true });
          await api.post('/auth/forgot-password', { email });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Failed to send reset email';
          return { success: false, message };
        }
      },

      // Reset Password
      resetPassword: async (token, password) => {
        try {
          set({ isLoading: true });
          await api.post('/auth/reset-password', { token, password });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Password reset failed';
          return { success: false, message };
        }
      },

      // Update User
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Check if user has permission
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        
        switch (permission) {
          case 'admin':
            return user.role === 'admin';
          case 'pro':
            return user.subscription?.plan === 'pro' && user.subscription?.isActive;
          default:
            return true;
        }
      },

      // Get subscription limits
      getSubscriptionLimits: () => {
        const { user } = get();
        if (!user) return null;
        
        return user.subscription?.limits || {
          widgets: 3,
          projects: 1,
          pageViews: 1000,
          removeBranding: false
        };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);