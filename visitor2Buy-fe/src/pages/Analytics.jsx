import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedWidget, setSelectedWidget] = useState(searchParams.get('widget') || '');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedWidget, selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await api.get(`/analytics/dashboard?period=${dateRange}`);
      setAnalytics(analyticsResponse.data);

      // Fetch widgets and projects for filters
      const [widgetsResponse, projectsResponse] = await Promise.all([
        api.get('/widgets'),
        api.get('/projects')
      ]);
      
      setWidgets(widgetsResponse.data.data);
      setProjects(projectsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const chartData = [
    { date: '2024-01-01', impressions: 1200, clicks: 89, conversions: 12, ctr: 7.4, conversionRate: 13.5 },
    { date: '2024-01-02', impressions: 1100, clicks: 95, conversions: 15, ctr: 8.6, conversionRate: 15.8 },
    { date: '2024-01-03', impressions: 1350, clicks: 102, conversions: 18, ctr: 7.6, conversionRate: 17.6 },
    { date: '2024-01-04', impressions: 1450, clicks: 118, conversions: 22, ctr: 8.1, conversionRate: 18.6 },
    { date: '2024-01-05', impressions: 1320, clicks: 108, conversions: 19, ctr: 8.2, conversionRate: 17.6 },
    { date: '2024-01-06', impressions: 1280, clicks: 95, conversions: 16, ctr: 7.4, conversionRate: 16.8 },
    { date: '2024-01-07', impressions: 1400, clicks: 125, conversions: 25, ctr: 8.9, conversionRate: 20.0 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#3B82F6' },
    { name: 'Mobile', value: 40, color: '#10B981' },
    { name: 'Tablet', value: 15, color: '#F59E0B' }
  ];

  const topWidgets = [
    { name: 'Welcome Popup', impressions: 5420, clicks: 432, conversions: 89, ctr: 8.0 },
    { name: 'Exit Intent Offer', impressions: 3210, clicks: 298, conversions: 67, ctr: 9.3 },
    { name: 'Newsletter Signup', impressions: 2890, clicks: 234, conversions: 45, ctr: 8.1 },
    { name: 'Product Promotion', impressions: 2150, clicks: 187, conversions: 34, ctr: 8.7 }
  ];

  const stats = [
    {
      name: 'Total Impressions',
      value: analytics?.summary?.totalImpressions || 9100,
      change: '+12.5%',
      changeType: 'positive',
      icon: Eye,
      color: 'blue'
    },
    {
      name: 'Total Clicks',
      value: analytics?.summary?.totalClicks || 832,
      change: '+8.2%',
      changeType: 'positive',
      icon: MousePointer,
      color: 'green'
    },
    {
      name: 'Conversions',
      value: analytics?.summary?.totalConversions || 117,
      change: '+23.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      name: 'Avg. CTR',
      value: analytics?.summary?.averageCTR || '8.1%',
      change: '-0.3%',
      changeType: 'negative',
      icon: Activity,
      color: 'orange'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track performance and optimize your conversion widgets.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Widget Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Widget
            </label>
            <select
              value={selectedWidget}
              onChange={(e) => setSelectedWidget(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Widgets</option>
              {widgets.map((widget) => (
                <option key={widget._id} value={widget._id}>
                  {widget.name}
                </option>
              ))}
            </select>
          </div>
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
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
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
                        <span className="ml-1">{stat.change}</span>
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
        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Daily metrics</span>
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
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stackId="1"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                  name="Impressions"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stackId="2"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rates</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Percentage</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Click-through Rate"
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  name="Conversion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Device Analytics & Top Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Device Breakdown</h3>
            <PieChart className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {deviceData.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {device.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{device.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performing Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Widgets</h3>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topWidgets.map((widget, index) => (
              <div key={widget.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{widget.name}</h4>
                    <span className="text-sm font-semibold text-blue-600">{widget.ctr}% CTR</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {widget.impressions.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <MousePointer className="h-3 w-3 mr-1" />
                      {widget.clicks}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {widget.conversions}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'impression', widget: 'Welcome Popup', time: '2 minutes ago', device: 'desktop' },
              { action: 'click', widget: 'Exit Intent Offer', time: '3 minutes ago', device: 'mobile' },
              { action: 'conversion', widget: 'Newsletter Signup', time: '5 minutes ago', device: 'desktop' },
              { action: 'impression', widget: 'Product Promotion', time: '7 minutes ago', device: 'tablet' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.action === 'impression' ? 'bg-blue-100 text-blue-600' :
                  activity.action === 'click' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.action === 'impression' && <Eye className="h-4 w-4" />}
                  {activity.action === 'click' && <MousePointer className="h-4 w-4" />}
                  {activity.action === 'conversion' && <TrendingUp className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action === 'impression' && 'Widget shown'}
                    {activity.action === 'click' && 'Widget clicked'}
                    {activity.action === 'conversion' && 'Conversion completed'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.widget} • {activity.time}
                  </p>
                </div>
                <div className="flex items-center text-gray-400">
                  {activity.device === 'desktop' && <Monitor className="h-4 w-4" />}
                  {activity.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                  {activity.device === 'tablet' && <Globe className="h-4 w-4" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;