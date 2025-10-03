import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  BarChart3,
  MousePointer,
  TrendingUp,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Widgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchParams] = useSearchParams();
  const { user, getSubscriptionLimits } = useAuthStore();

  useEffect(() => {
    fetchWidgets();
    fetchProjects();
    
    // Set project filter from URL params
    const projectParam = searchParams.get('project');
    if (projectParam) {
      setSelectedProject(projectParam);
    }
  }, [searchParams]);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams.get('project')) {
        params.append('project', searchParams.get('project'));
      }
      
      const response = await api.get(`/widgets?${params.toString()}`);
      setWidgets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
      toast.error('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    try {
      await api.delete(`/widgets/${widgetId}`);
      setWidgets(widgets.filter(w => w._id !== widgetId));
      toast.success('Widget deleted successfully');
    } catch (error) {
      console.error('Failed to delete widget:', error);
      toast.error('Failed to delete widget');
    }
  };

  const handleToggleStatus = async (widget) => {
    const newStatus = widget.status === 'active' ? 'paused' : 'active';
    
    try {
      await api.put(`/widgets/${widget._id}`, { status: newStatus });
      setWidgets(widgets.map(w => 
        w._id === widget._id ? { ...w, status: newStatus } : w
      ));
      toast.success(`Widget ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Failed to update widget status:', error);
      toast.error('Failed to update widget status');
    }
  };

  const handleDuplicateWidget = async (widget) => {
    try {
      const response = await api.post(`/widgets/${widget._id}/duplicate`);
      setWidgets([response.data.data, ...widgets]);
      toast.success('Widget duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate widget:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate widget');
    }
  };

  // Filter widgets based on search and filters
  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !selectedProject || widget.project._id === selectedProject;
    const matchesStatus = !selectedStatus || widget.status === selectedStatus;
    const matchesType = !selectedType || widget.type === selectedType;
    
    return matchesSearch && matchesProject && matchesStatus && matchesType;
  });

  const limits = getSubscriptionLimits();
  const canCreateWidget = user?.subscription?.plan === 'pro' || widgets.length < limits?.widgets;

  const widgetTypes = [
    { value: 'popup', label: 'Popup' },
    { value: 'banner', label: 'Banner' },
    { value: 'slide-in', label: 'Slide-in' },
    { value: 'floating-button', label: 'Floating Button' },
    { value: 'chat-widget', label: 'Chat Widget' },
    { value: 'notification-bar', label: 'Notification Bar' },
    { value: 'exit-intent', label: 'Exit Intent' },
    { value: 'cta-button', label: 'CTA Button' }
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
          <h1 className="text-3xl font-bold text-gray-900">Widgets</h1>
          <p className="mt-2 text-gray-600">
            Create and manage conversion widgets for your websites.
          </p>
        </div>
        <Link
          to="/widgets/new"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${
            canCreateWidget 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          onClick={!canCreateWidget ? (e) => e.preventDefault() : undefined}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Widget
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div>
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {widgetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Widget Limit Warning */}
      {!canCreateWidget && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Widget Limit Reached
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  You've reached the limit of {limits?.widgets} widget{limits?.widgets !== 1 ? 's' : ''} for your current plan.{' '}
                  <Link to="/billing" className="font-medium underline">
                    Upgrade to Pro
                  </Link>{' '}
                  for unlimited widgets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      {filteredWidgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWidgets.map((widget, index) => (
            <WidgetCard
              key={widget._id}
              widget={widget}
              index={index}
              onDelete={handleDeleteWidget}
              onToggleStatus={handleToggleStatus}
              onDuplicate={handleDuplicateWidget}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          hasWidgets={widgets.length > 0}
          canCreate={canCreateWidget}
        />
      )}
    </div>
  );
};

// Widget Card Component
const WidgetCard = ({ widget, index, onDelete, onToggleStatus, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getWidgetIcon = (type) => {
    switch (type) {
      case 'popup': return '🪟';
      case 'banner': return '📢';
      case 'slide-in': return '📱';
      case 'floating-button': return '🔘';
      case 'chat-widget': return '💬';
      case 'notification-bar': return '📊';
      case 'exit-intent': return '🚪';
      case 'cta-button': return '🎯';
      default: return '🎨';
    }
  };

  const getDeviceIcon = (devices) => {
    if (devices.includes('desktop') && devices.includes('mobile') && devices.includes('tablet')) {
      return <Globe className="h-4 w-4" />;
    } else if (devices.includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (devices.includes('desktop')) {
      return <Monitor className="h-4 w-4" />;
    } else if (devices.includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getWidgetIcon(widget.type)}</div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {widget.name}
              </h3>
              <p className="text-sm text-gray-500">
                {widget.type.replace('-', ' ')} • {widget.project?.name}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="py-1">
                    <Link
                      to={`/widgets/${widget._id}/edit`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit className="h-4 w-4 mr-3" />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        onToggleStatus(widget);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {widget.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-3" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(widget);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="h-4 w-4 mr-3" />
                      Duplicate
                    </button>
                    <Link
                      to={`/analytics?widget=${widget._id}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Analytics
                    </Link>
                    <button
                      onClick={() => {
                        onDelete(widget._id);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {widget.content?.headline && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {widget.content.headline}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {widget.analytics?.impressions || 0}
            </span>
            <span className="flex items-center">
              <MousePointer className="h-4 w-4 mr-1" />
              {widget.analytics?.clicks || 0}
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {widget.analytics?.conversions || 0}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-gray-400">
              {getDeviceIcon(widget.targeting?.devices || ['desktop', 'mobile', 'tablet'])}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              widget.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : widget.status === 'draft'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {widget.status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ hasWidgets, canCreate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <div className="text-6xl mb-4">🎨</div>
    <h3 className="mt-2 text-sm font-semibold text-gray-900">
      {hasWidgets ? 'No widgets match your filters' : 'No widgets yet'}
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      {hasWidgets 
        ? 'Try adjusting your search or filter criteria.' 
        : 'Get started by creating your first conversion widget.'
      }
    </p>
    {!hasWidgets && (
      <div className="mt-6">
        {canCreate ? (
          <Link
            to="/widgets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Widget
          </Link>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Upgrade to create more widgets
            </p>
            <Link
              to="/billing"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>
    )}
  </motion.div>
);

export default Widgets;