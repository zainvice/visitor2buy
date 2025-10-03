import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Globe,
  Settings,
  MoreVertical,
  Copy,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Code,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const { user, getSubscriptionLimits } = useAuthStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      const response = await api.post('/projects', formData);
      setProjects([response.data.data, ...projects]);
      setShowCreateModal(false);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated widgets.')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleShowEmbedCode = async (project) => {
    try {
      const response = await api.get(`/projects/${project._id}/embed-code`);
      setEmbedCode(response.data.data.embedCode);
      setSelectedProject(project);
      setShowEmbedModal(true);
    } catch (error) {
      console.error('Failed to get embed code:', error);
      toast.error('Failed to get embed code');
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const limits = getSubscriptionLimits();
  const canCreateProject = user?.subscription?.plan === 'pro' || projects.length < limits?.projects;

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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your websites and domains where widgets will be displayed.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateProject}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Subscription Limit Warning */}
      {!canCreateProject && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Project Limit Reached
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  You've reached the limit of {limits?.projects} project{limits?.projects !== 1 ? 's' : ''} for your current plan.{' '}
                  <Link to="/billing" className="font-medium underline">
                    Upgrade to Pro
                  </Link>{' '}
                  for unlimited projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={index}
              onDelete={handleDeleteProject}
              onShowEmbed={handleShowEmbedCode}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateProject={() => setShowCreateModal(true)} />
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
          />
        )}
      </AnimatePresence>

      {/* Embed Code Modal */}
      <AnimatePresence>
        {showEmbedModal && (
          <EmbedCodeModal
            project={selectedProject}
            embedCode={embedCode}
            onClose={() => setShowEmbedModal(false)}
            onCopy={copyEmbedCode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, index, onDelete, onShowEmbed }) => {
  const [showMenu, setShowMenu] = useState(false);

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
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {project.domain}
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
                    <button
                      onClick={() => {
                        onShowEmbed(project);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Code className="h-4 w-4 mr-3" />
                      Get Embed Code
                    </button>
                    <Link
                      to={`/projects/${project._id}/settings`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        onDelete(project._id);
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

        {project.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {project.analytics?.totalImpressions || 0} views
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
          
          <Link
            to={`/widgets?project=${project._id}`}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            View Widgets →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ onCreateProject }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <Globe className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
    <p className="mt-1 text-sm text-gray-500">
      Get started by creating your first project.
    </p>
    <div className="mt-6">
      <button
        onClick={onCreateProject}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </button>
    </div>
  </motion.div>
);

// Create Project Modal Component
const CreateProjectModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: '',
    allowedDomains: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        allowedDomains: formData.allowedDomains
          .split(',')
          .map(domain => domain.trim())
          .filter(domain => domain.length > 0)
      };
      
      await onCreate(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Create New Project
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="My Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief description of your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Domains (Optional)
                </label>
                <input
                  type="text"
                  value={formData.allowedDomains}
                  onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="www.example.com, app.example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of additional domains
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Embed Code Modal Component
const EmbedCodeModal = ({ project, embedCode, onClose, onCopy }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
      >
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Install Visitor2Buy on {project?.name}
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                1. Copy the embed code
              </h4>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <button
                  onClick={onCopy}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded border"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                2. Add to your website
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Paste the code before the closing &lt;/head&gt; tag on every page where you want widgets to appear.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Installation Tips
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>For WordPress: Use a plugin like "Insert Headers and Footers"</li>
                        <li>For Shopify: Add to theme.liquid file</li>
                        <li>For other platforms: Add to your template's head section</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <Link
              to="/widgets/new"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create First Widget
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export default Projects;