import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  ArrowLeft,
  Settings,
  Palette,
  Target,
  Calendar,
  Code,
  Smartphone,
  Monitor,
  Tablet,
  Upload,
  Plus,
  Trash2,
  Move,
  Type,
  Image as ImageIcon,
  MousePointer
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const WidgetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [projects, setProjects] = useState([]);
  
  const [widget, setWidget] = useState({
    name: '',
    project: '',
    type: 'popup',
    status: 'draft',
    content: {
      headline: 'Welcome to our website!',
      subheadline: 'Get 10% off your first order',
      description: 'Join thousands of satisfied customers and save on your first purchase.',
      buttons: [{
        text: 'Get Discount',
        action: 'url',
        value: '',
        style: 'primary'
      }],
      images: [],
      form: {
        enabled: false,
        fields: [],
        submitText: 'Submit',
        successMessage: 'Thank you for your submission!'
      }
    },
    design: {
      template: 'default',
      position: 'center',
      size: {
        width: '400px',
        height: 'auto'
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: 'normal'
      },
      spacing: {
        padding: '24px',
        margin: '0px',
        borderRadius: '12px'
      },
      effects: {
        shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        animation: 'fade',
        duration: 300
      },
      customCSS: ''
    },
    targeting: {
      devices: ['desktop', 'mobile', 'tablet'],
      pages: {
        include: [],
        exclude: []
      },
      countries: [],
      timeOnSite: { min: 0, max: 0 },
      scrollPercentage: 0,
      exitIntent: false,
      visitCount: { min: 1, max: 0 },
      referrers: [],
      customRules: []
    },
    triggers: {
      delay: 0,
      frequency: 'once',
      cookieDuration: 30
    },
    settings: {
      closeButton: {
        enabled: true,
        position: 'top-right'
      },
      overlay: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        clickToClose: true
      },
      sound: {
        enabled: false,
        url: ''
      },
      responsive: {
        enabled: true,
        breakpoints: {
          mobile: '768px',
          tablet: '1024px'
        }
      }
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      timezone: 'UTC',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeRange: {
        start: '00:00',
        end: '23:59'
      }
    }
  });

  useEffect(() => {
    fetchProjects();
    if (id) {
      fetchWidget();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
      
      // Set default project if creating new widget
      if (!id && response.data.data.length > 0) {
        setWidget(prev => ({ ...prev, project: response.data.data[0]._id }));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchWidget = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/widgets/${id}`);
      setWidget(response.data.data);
    } catch (error) {
      console.error('Failed to fetch widget:', error);
      toast.error('Failed to load widget');
      navigate('/widgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!widget.name.trim()) {
      toast.error('Please enter a widget name');
      return;
    }

    if (!widget.project) {
      toast.error('Please select a project');
      return;
    }

    try {
      setSaving(true);
      
      if (id) {
        await api.put(`/widgets/${id}`, widget);
        toast.success('Widget updated successfully!');
      } else {
        const response = await api.post('/widgets', widget);
        toast.success('Widget created successfully!');
        navigate(`/widgets/${response.data.data._id}/edit`);
      }
    } catch (error) {
      console.error('Failed to save widget:', error);
      toast.error(error.response?.data?.message || 'Failed to save widget');
    } finally {
      setSaving(false);
    }
  };

  const updateWidget = (path, value) => {
    setWidget(prev => {
      const newWidget = { ...prev };
      const keys = path.split('.');
      let current = newWidget;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newWidget;
    });
  };

  const addButton = () => {
    const newButton = {
      text: 'Click Me',
      action: 'url',
      value: '',
      style: 'primary'
    };
    
    setWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: [...prev.content.buttons, newButton]
      }
    }));
  };

  const removeButton = (index) => {
    setWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: prev.content.buttons.filter((_, i) => i !== index)
      }
    }));
  };

  const addFormField = () => {
    const newField = {
      type: 'text',
      name: `field_${Date.now()}`,
      label: 'New Field',
      placeholder: '',
      required: false,
      options: []
    };
    
    setWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        form: {
          ...prev.content.form,
          fields: [...prev.content.form.fields, newField]
        }
      }
    }));
  };

  const removeFormField = (index) => {
    setWidget(prev => ({
      ...prev,
      content: {
        ...prev.content,
        form: {
          ...prev.content.form,
          fields: prev.content.form.fields.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const tabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'targeting', label: 'Targeting', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'schedule', label: 'Schedule', icon: Calendar }
  ];

  const widgetTypes = [
    { value: 'popup', label: 'Popup', description: 'Modal overlay popup' },
    { value: 'banner', label: 'Banner', description: 'Top or bottom banner' },
    { value: 'slide-in', label: 'Slide-in', description: 'Slides from corner' },
    { value: 'floating-button', label: 'Floating Button', description: 'Fixed position button' },
    { value: 'chat-widget', label: 'Chat Widget', description: 'Chat interface' },
    { value: 'notification-bar', label: 'Notification Bar', description: 'Notification strip' },
    { value: 'exit-intent', label: 'Exit Intent', description: 'Shows on exit attempt' },
    { value: 'cta-button', label: 'CTA Button', description: 'Call-to-action button' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/widgets')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {id ? 'Edit Widget' : 'Create Widget'}
                </h1>
                <p className="text-sm text-gray-500">
                  {widget.name || 'Untitled Widget'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-md ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-md ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-md ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Editor */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'design' && (
                  <DesignTab widget={widget} updateWidget={updateWidget} widgetTypes={widgetTypes} />
                )}
                {activeTab === 'content' && (
                  <ContentTab 
                    widget={widget} 
                    updateWidget={updateWidget}
                    addButton={addButton}
                    removeButton={removeButton}
                    addFormField={addFormField}
                    removeFormField={removeFormField}
                  />
                )}
                {activeTab === 'targeting' && (
                  <TargetingTab widget={widget} updateWidget={updateWidget} />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab widget={widget} updateWidget={updateWidget} />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleTab widget={widget} updateWidget={updateWidget} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <WidgetPreview widget={widget} device={previewDevice} projects={projects} />
        </div>
      </div>
    </div>
  );
};

// Design Tab Component
const DesignTab = ({ widget, updateWidget, widgetTypes }) => (
  <div className="space-y-6">
    {/* Basic Info */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Widget Name
      </label>
      <input
        type="text"
        value={widget.name}
        onChange={(e) => updateWidget('name', e.target.value)}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter widget name"
      />
    </div>

    {/* Widget Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Widget Type
      </label>
      <div className="grid grid-cols-1 gap-2">
        {widgetTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => updateWidget('type', type.value)}
            className={`p-3 text-left border rounded-lg ${
              widget.type === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{type.label}</div>
            <div className="text-xs text-gray-500">{type.description}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Colors */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Colors
      </label>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(widget.design.colors).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
              {key}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={value}
                onChange={(e) => updateWidget(`design.colors.${key}`, e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => updateWidget(`design.colors.${key}`, e.target.value)}
                className="flex-1 text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Typography */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Typography
      </label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Font Size
          </label>
          <input
            type="text"
            value={widget.design.typography.fontSize}
            onChange={(e) => updateWidget('design.typography.fontSize', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Font Weight
          </label>
          <select
            value={widget.design.typography.fontWeight}
            onChange={(e) => updateWidget('design.typography.fontWeight', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semibold</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>
    </div>

    {/* Spacing */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Spacing
      </label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Padding
          </label>
          <input
            type="text"
            value={widget.design.spacing.padding}
            onChange={(e) => updateWidget('design.spacing.padding', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Border Radius
          </label>
          <input
            type="text"
            value={widget.design.spacing.borderRadius}
            onChange={(e) => updateWidget('design.spacing.borderRadius', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// Content Tab Component
const ContentTab = ({ widget, updateWidget, addButton, removeButton, addFormField, removeFormField }) => (
  <div className="space-y-6">
    {/* Headlines */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Headline
      </label>
      <input
        type="text"
        value={widget.content.headline}
        onChange={(e) => updateWidget('content.headline', e.target.value)}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter headline"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Subheadline
      </label>
      <input
        type="text"
        value={widget.content.subheadline}
        onChange={(e) => updateWidget('content.subheadline', e.target.value)}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter subheadline"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Description
      </label>
      <textarea
        value={widget.content.description}
        onChange={(e) => updateWidget('content.description', e.target.value)}
        rows={3}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter description"
      />
    </div>

    {/* Buttons */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Buttons
        </label>
        <button
          onClick={addButton}
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Button
        </button>
      </div>
      
      <div className="space-y-3">
        {widget.content.buttons.map((button, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Button {index + 1}</span>
              <button
                onClick={() => removeButton(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                value={button.text}
                onChange={(e) => {
                  const newButtons = [...widget.content.buttons];
                  newButtons[index].text = e.target.value;
                  updateWidget('content.buttons', newButtons);
                }}
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Button text"
              />
              
              <select
                value={button.action}
                onChange={(e) => {
                  const newButtons = [...widget.content.buttons];
                  newButtons[index].action = e.target.value;
                  updateWidget('content.buttons', newButtons);
                }}
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="url">Open URL</option>
                <option value="close">Close Widget</option>
                <option value="phone">Call Phone</option>
                <option value="email">Send Email</option>
              </select>
              
              {button.action !== 'close' && (
                <input
                  type="text"
                  value={button.value}
                  onChange={(e) => {
                    const newButtons = [...widget.content.buttons];
                    newButtons[index].value = e.target.value;
                    updateWidget('content.buttons', newButtons);
                  }}
                  className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    button.action === 'url' ? 'https://example.com' :
                    button.action === 'phone' ? '+1234567890' :
                    button.action === 'email' ? 'contact@example.com' : ''
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Form */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={widget.content.form.enabled}
            onChange={(e) => updateWidget('content.form.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Form</span>
        </label>
        
        {widget.content.form.enabled && (
          <button
            onClick={addFormField}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </button>
        )}
      </div>

      {widget.content.form.enabled && (
        <div className="space-y-3">
          {widget.content.form.fields.map((field, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Field {index + 1}</span>
                <button
                  onClick={() => removeFormField(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...widget.content.form.fields];
                    newFields[index].type = e.target.value;
                    updateWidget('content.form.fields', newFields);
                  }}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="select">Select</option>
                  <option value="textarea">Textarea</option>
                </select>
                
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...widget.content.form.fields];
                    newFields[index].label = e.target.value;
                    updateWidget('content.form.fields', newFields);
                  }}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Field label"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Targeting Tab Component
const TargetingTab = ({ widget, updateWidget }) => (
  <div className="space-y-6">
    {/* Device Targeting */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Device Targeting
      </label>
      <div className="space-y-2">
        {['desktop', 'mobile', 'tablet'].map((device) => (
          <label key={device} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={widget.targeting.devices.includes(device)}
              onChange={(e) => {
                const devices = e.target.checked
                  ? [...widget.targeting.devices, device]
                  : widget.targeting.devices.filter(d => d !== device);
                updateWidget('targeting.devices', devices);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm capitalize">{device}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Page Targeting */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Page Targeting
      </label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Include Pages (URL patterns)
          </label>
          <textarea
            value={widget.targeting.pages.include.join('\n')}
            onChange={(e) => updateWidget('targeting.pages.include', e.target.value.split('\n').filter(Boolean))}
            rows={3}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="/products&#10;/pricing&#10;/about"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Exclude Pages (URL patterns)
          </label>
          <textarea
            value={widget.targeting.pages.exclude.join('\n')}
            onChange={(e) => updateWidget('targeting.pages.exclude', e.target.value.split('\n').filter(Boolean))}
            rows={3}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="/checkout&#10;/admin"
          />
        </div>
      </div>
    </div>

    {/* Behavioral Targeting */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Behavioral Targeting
      </label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Time on Site (seconds)
          </label>
          <input
            type="number"
            value={widget.targeting.timeOnSite.min}
            onChange={(e) => updateWidget('targeting.timeOnSite.min', parseInt(e.target.value) || 0)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Scroll Percentage
          </label>
          <input
            type="number"
            value={widget.targeting.scrollPercentage}
            onChange={(e) => updateWidget('targeting.scrollPercentage', parseInt(e.target.value) || 0)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            min="0"
            max="100"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={widget.targeting.exitIntent}
            onChange={(e) => updateWidget('targeting.exitIntent', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Exit Intent Detection</span>
        </label>
      </div>
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab = ({ widget, updateWidget }) => (
  <div className="space-y-6">
    {/* Close Button */}
    <div>
      <label className="flex items-center space-x-2 mb-3">
        <input
          type="checkbox"
          checked={widget.settings.closeButton.enabled}
          onChange={(e) => updateWidget('settings.closeButton.enabled', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Show Close Button</span>
      </label>
      
      {widget.settings.closeButton.enabled && (
        <select
          value={widget.settings.closeButton.position}
          onChange={(e) => updateWidget('settings.closeButton.position', e.target.value)}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="inside">Inside Widget</option>
          <option value="outside">Outside Widget</option>
        </select>
      )}
    </div>

    {/* Overlay */}
    <div>
      <label className="flex items-center space-x-2 mb-3">
        <input
          type="checkbox"
          checked={widget.settings.overlay.enabled}
          onChange={(e) => updateWidget('settings.overlay.enabled', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Show Overlay</span>
      </label>
      
      {widget.settings.overlay.enabled && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Overlay Color
            </label>
            <input
              type="text"
              value={widget.settings.overlay.color}
              onChange={(e) => updateWidget('settings.overlay.color', e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="rgba(0, 0, 0, 0.5)"
            />
          </div>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={widget.settings.overlay.clickToClose}
              onChange={(e) => updateWidget('settings.overlay.clickToClose', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Click Overlay to Close</span>
          </label>
        </div>
      )}
    </div>

    {/* Triggers */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Triggers
      </label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Delay (seconds)
          </label>
          <input
            type="number"
            value={widget.triggers.delay}
            onChange={(e) => updateWidget('triggers.delay', parseInt(e.target.value) || 0)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Frequency
          </label>
          <select
            value={widget.triggers.frequency}
            onChange={(e) => updateWidget('triggers.frequency', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="once">Once per visitor</option>
            <option value="daily">Once per day</option>
            <option value="session">Once per session</option>
            <option value="always">Every page view</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Schedule Tab Component
const ScheduleTab = ({ widget, updateWidget }) => (
  <div className="space-y-6">
    {/* Date Range */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Date Range
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={widget.schedule.startDate}
            onChange={(e) => updateWidget('schedule.startDate', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={widget.schedule.endDate}
            onChange={(e) => updateWidget('schedule.endDate', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    {/* Days of Week */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Days of Week
      </label>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <button
            key={day}
            onClick={() => {
              const days = widget.schedule.daysOfWeek.includes(index)
                ? widget.schedule.daysOfWeek.filter(d => d !== index)
                : [...widget.schedule.daysOfWeek, index];
              updateWidget('schedule.daysOfWeek', days);
            }}
            className={`p-2 text-xs font-medium rounded ${
              widget.schedule.daysOfWeek.includes(index)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>

    {/* Time Range */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Time Range
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={widget.schedule.timeRange.start}
            onChange={(e) => updateWidget('schedule.timeRange.start', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={widget.schedule.timeRange.end}
            onChange={(e) => updateWidget('schedule.timeRange.end', e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// Widget Preview Component
const WidgetPreview = ({ widget, device, projects }) => {
  const project = projects.find(p => p._id === widget.project);
  
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const getWidgetStyles = () => {
    const { design } = widget;
    return {
      backgroundColor: design.colors.background,
      color: design.colors.text,
      fontFamily: design.typography.fontFamily,
      fontSize: design.typography.fontSize,
      fontWeight: design.typography.fontWeight,
      padding: design.spacing.padding,
      borderRadius: design.spacing.borderRadius,
      boxShadow: design.effects.shadow,
      border: `1px solid ${design.colors.border}`,
      maxWidth: design.size.width,
      margin: '0 auto'
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            <p className="text-sm text-gray-500">
              {project?.name || 'Select a project'} • {device}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Live Preview</span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`${getDeviceStyles()} h-full`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-96 relative">
            {/* Simulated Website Content */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {project?.name || 'Your Website'}
              </h1>
              <p className="text-gray-600">
                This is a preview of how your widget will appear on your website.
              </p>
            </div>

            {/* Widget Preview */}
            {widget.type === 'popup' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div style={getWidgetStyles()}>
                  <WidgetContent widget={widget} />
                </div>
              </div>
            )}

            {widget.type === 'banner' && (
              <div className="fixed top-0 left-0 right-0 z-50" style={{
                backgroundColor: widget.design.colors.background,
                color: widget.design.colors.text,
                padding: widget.design.spacing.padding,
                textAlign: 'center',
                borderBottom: `1px solid ${widget.design.colors.border}`
              }}>
                <WidgetContent widget={widget} compact />
              </div>
            )}

            {widget.type === 'floating-button' && (
              <div className="fixed bottom-6 right-6 z-50">
                <button style={{
                  backgroundColor: widget.design.colors.primary,
                  color: widget.design.colors.background,
                  padding: '12px 24px',
                  borderRadius: widget.design.spacing.borderRadius,
                  border: 'none',
                  boxShadow: widget.design.effects.shadow,
                  fontSize: widget.design.typography.fontSize,
                  fontWeight: widget.design.typography.fontWeight
                }}>
                  {widget.content.buttons[0]?.text || 'Click Me'}
                </button>
              </div>
            )}

            {['slide-in', 'chat-widget', 'notification-bar', 'exit-intent', 'cta-button'].includes(widget.type) && (
              <div className="fixed bottom-6 right-6 z-50" style={getWidgetStyles()}>
                <WidgetContent widget={widget} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Widget Content Component
const WidgetContent = ({ widget, compact = false }) => (
  <div className="text-center">
    {widget.content.headline && (
      <h2 className={`font-bold mb-2 ${compact ? 'text-lg' : 'text-xl'}`} style={{ color: widget.design.colors.primary }}>
        {widget.content.headline}
      </h2>
    )}
    
    {!compact && widget.content.subheadline && (
      <h3 className="text-lg font-medium mb-3" style={{ color: widget.design.colors.secondary }}>
        {widget.content.subheadline}
      </h3>
    )}
    
    {!compact && widget.content.description && (
      <p className="mb-4 text-sm">
        {widget.content.description}
      </p>
    )}
    
    {widget.content.buttons.length > 0 && (
      <div className={`flex ${compact ? 'justify-center space-x-2' : 'flex-col space-y-2'}`}>
        {widget.content.buttons.slice(0, compact ? 1 : 3).map((button, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded font-medium ${compact ? 'text-sm' : ''}`}
            style={{
              backgroundColor: button.style === 'primary' ? widget.design.colors.primary : 'transparent',
              color: button.style === 'primary' ? widget.design.colors.background : widget.design.colors.primary,
              border: button.style === 'primary' ? 'none' : `1px solid ${widget.design.colors.primary}`
            }}
          >
            {button.text}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default WidgetEditor;