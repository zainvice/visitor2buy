import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Crown,
  Zap,
  Shield,
  Users
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Billing = () => {
  const { user, updateUser } = useAuthStore();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/subscription-status');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await api.post('/payments/create-checkout-session');
      
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await api.post('/payments/cancel-subscription');
      setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true }));
      toast.success('Subscription will be canceled at the end of your billing period');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setLoading(true);
      await api.post('/payments/reactivate-subscription');
      setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: false }));
      toast.success('Subscription reactivated successfully');
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const response = await api.post('/payments/create-portal-session');
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPro = user?.subscription?.plan === 'pro' && user?.subscription?.isActive;
  const limits = user?.subscription?.limits || {
    widgets: 3,
    projects: 1,
    pageViews: 1000,
    removeBranding: false
  };

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${isPro ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {isPro ? (
                  <Crown className="h-6 w-6 text-blue-600" />
                ) : (
                  <Users className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h3>
                <p className="text-gray-600">
                  {isPro 
                    ? 'Unlimited widgets and advanced features'
                    : 'Basic features to get you started'
                  }
                </p>
                {subscription?.currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subscription.cancelAtPeriodEnd 
                      ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                      : `Renews on ${formatDate(subscription.currentPeriodEnd)}`
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isPro ? (
                <>
                  <button
                    onClick={handleManageBilling}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                  </button>
                  
                  {subscription?.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Plan
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Subscription Canceled
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your subscription has been canceled and will end on{' '}
                      <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
                      You can reactivate it anytime before then.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage & Limits */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Usage & Limits</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {limits.widgets === -1 ? '∞' : limits.widgets}
              </div>
              <div className="text-sm text-gray-600">Widgets Allowed</div>
              <div className="text-xs text-gray-500 mt-1">
                {limits.widgets === -1 ? 'Unlimited' : `${limits.widgets} total`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {limits.projects === -1 ? '∞' : limits.projects}
              </div>
              <div className="text-sm text-gray-600">Projects Allowed</div>
              <div className="text-xs text-gray-500 mt-1">
                {limits.projects === -1 ? 'Unlimited' : `${limits.projects} total`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {limits.pageViews === -1 ? '∞' : limits.pageViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Page Views/Month</div>
              <div className="text-xs text-gray-500 mt-1">
                {limits.pageViews === -1 ? 'Unlimited' : 'Monthly limit'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Remove Branding</span>
              {limits.removeBranding ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Priority Support</span>
              {isPro ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Advanced Analytics</span>
              {isPro ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">API Access</span>
              {isPro ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Benefits (for free users) */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white"
        >
          <div className="text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-4">Unlock Pro Features</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get unlimited widgets, remove branding, access advanced analytics, and much more with our Pro plan.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                Unlimited widgets
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                Remove branding
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                Advanced targeting
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                Priority support
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-center">
                <div className="text-3xl font-bold">$29</div>
                <div className="text-blue-200 text-sm">per month</div>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg shadow-sm text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <Zap className="h-5 w-5 mr-2" />
                )}
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Method */}
      {isPro && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Payment method managed by Stripe
                  </h3>
                  <p className="text-sm text-gray-500">
                    Use the billing portal to update your payment method
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          {isPro && (
            <button
              onClick={handleManageBilling}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </button>
          )}
        </div>
        
        <div className="p-6">
          {isPro ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                View Full Billing History
              </h3>
              <p className="text-gray-600 mb-4">
                Access your complete billing history and download invoices through the Stripe billing portal.
              </p>
              <button
                onClick={handleManageBilling}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Billing Portal
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Billing History
              </h3>
              <p className="text-gray-600">
                You're currently on the free plan. Upgrade to Pro to see your billing history here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;