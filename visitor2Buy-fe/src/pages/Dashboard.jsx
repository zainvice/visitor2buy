import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Plus,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentWidgets, setRecentWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await api.get('/analytics/dashboard?period=30d');
      setAnalytics(analyticsResponse.data);

      // Fetch recent widgets
      const widgetsResponse = await api.get('/widgets?limit=5');
      setRecentWidgets(widgetsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data for demonstration
  const chartData = [
    { name: 'Jan 1', impressions: 400, clicks: 240, conversions: 24 },
    { name: 'Jan 2', impressions: 300, clicks: 139, conversions: 22 },
    { name: 'Jan 3', impressions: 200, clicks: 980, conversions: 29 },
    { name: 'Jan 4', impressions: 278, clicks: 390, conversions: 20 },
    { name: 'Jan 5', impressions: 189, clicks: 480, conversions: 21 },
    { name: 'Jan 6', impressions: 239, clicks: 380, conversions: 25 },
    { name: 'Jan 7', impressions: 349, clicks: 430, conversions: 21 },
  ];

  const stats = [
    {
      name: 'Total Impressions',
      value: analytics?.summary?.totalImpressions || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Eye,
    },
    {
      name: 'Total Clicks',
      value: analytics?.summary?.totalClicks || 0,
      change: '+8%',
      changeType: 'positive',
      icon: MousePointer,
    },
    {
      name: 'Conversions',
      value: analytics?.summary?.totalConversions || 0,
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Active Widgets',
      value: analytics?.summary?.activeWidgets || 0,
      change: '+2',
      changeType: 'positive',
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your widgets today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/widgets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Widget
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value.toLocaleString()}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stackId="1"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stackId="2"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Rate Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Trending up</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white shadow-sm rounded-lg border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Widgets</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentWidgets.length > 0 ? (
              recentWidgets.map((widget) => (
                <div key={widget._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {widget.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {widget.type} • {widget.status}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {widget.analytics?.impressions || 0} views
                      </span>
                      <Link
                        to={`/widgets/${widget._id}/edit`}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No widgets yet</p>
                <Link
                  to="/widgets/new"
                  className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first widget
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white shadow-sm rounded-lg border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/widgets/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  Create New Widget
                </p>
                <p className="text-sm text-gray-500">
                  Design a popup, banner, or CTA
                </p>
              </div>
            </Link>

            <Link
              to="/projects"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  Add New Project
                </p>
                <p className="text-sm text-gray-500">
                  Set up a new website
                </p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  View Analytics
                </p>
                <p className="text-sm text-gray-500">
                  Check performance metrics
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subscription Status */}
      {user?.subscription?.plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-blue-100">
                Unlock unlimited widgets, remove branding, and get advanced analytics.
              </p>
            </div>
            <Link
              to="/billing"
              className="flex-shrink-0 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;