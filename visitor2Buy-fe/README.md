# Visitor2Buy Frontend

A modern, responsive React application for the Visitor2Buy customer engagement platform. Built with Vite, React 19, Tailwind CSS, and TypeScript.

## 🚀 Features

### Core Features
- **Authentication System** - Login, register, password reset with JWT
- **Dashboard Layout** - Responsive sidebar navigation with user management
- **Project Management** - Create and manage website projects with embed codes
- **Widget Editor** - Advanced WYSIWYG editor with real-time preview
- **Analytics Dashboard** - Comprehensive charts and metrics with Recharts
- **Billing Integration** - Stripe-powered subscription management
- **Admin Panel** - User management and system analytics (admin only)

### UI/UX Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Smooth Animations** - Framer Motion for delightful interactions
- **Modern Components** - Clean, accessible UI components
- **Real-time Updates** - Live data updates and notifications
- **Dark Mode Ready** - Prepared for dark mode implementation

### Technical Features
- **State Management** - Zustand for global state management
- **Form Handling** - React Hook Form with validation
- **API Integration** - Axios with interceptors and error handling
- **Type Safety** - TypeScript for better development experience
- **Performance** - Code splitting and lazy loading

## 📦 Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for analytics visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with interceptors
- **Payments**: Stripe React integration
- **Notifications**: React Hot Toast

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── pages/               # Route components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Projects.jsx     # Project management
│   ├── Widgets.jsx      # Widget listing
│   ├── WidgetEditor.jsx # Widget creation/editing
│   ├── Analytics.jsx    # Analytics dashboard
│   ├── Settings.jsx     # User settings
│   ├── Billing.jsx      # Subscription management
│   └── AdminPanel.jsx   # Admin interface
├── stores/              # Zustand stores
│   └── authStore.js     # Authentication state
├── services/            # API services
│   └── api.js           # Axios configuration
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## 🎨 Key Components

### Authentication System
- **Login/Register** - Clean forms with validation
- **Password Reset** - Email-based password recovery
- **Protected Routes** - Route guards for authenticated users
- **Role-based Access** - Admin-only routes and features

### Dashboard Layout
- **Responsive Sidebar** - Collapsible navigation with icons
- **User Menu** - Profile dropdown with logout
- **Breadcrumbs** - Navigation context
- **Search** - Global search functionality

### Widget Editor
- **Visual Editor** - WYSIWYG interface with live preview
- **Device Preview** - Desktop, tablet, mobile views
- **Targeting Builder** - Advanced targeting rule configuration
- **Content Management** - Rich text editing and media upload
- **Form Builder** - Dynamic form field creation

### Analytics Dashboard
- **Interactive Charts** - Line, area, and pie charts
- **Real-time Metrics** - Live performance data
- **Filtering** - Date range and widget filtering
- **Export Options** - Data export functionality

### Billing Integration
- **Stripe Checkout** - Seamless payment processing
- **Subscription Management** - Plan upgrades and cancellations
- **Usage Tracking** - Current plan limits and usage
- **Billing History** - Invoice management

## 🔧 Configuration

### API Integration
The app connects to the Visitor2Buy backend API:
```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### State Management
Global state is managed with Zustand:
```javascript
// Authentication state
const { user, login, logout } = useAuthStore();
```

### Routing
React Router v7 with protected routes:
```javascript
// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
};
```

## 🎯 Features by Page

### Landing Page (`/`)
- Hero section with value proposition
- Feature highlights with animations
- Testimonials and social proof
- Pricing overview
- Call-to-action sections

### Dashboard (`/dashboard`)
- Performance metrics overview
- Recent activity feed
- Quick action buttons
- Charts and analytics summary
- Subscription status

### Projects (`/projects`)
- Project listing with search/filter
- Create new project modal
- Embed code generation
- Project settings management
- Usage statistics

### Widgets (`/widgets`)
- Widget gallery with filtering
- Widget status management
- Duplicate and delete actions
- Performance metrics per widget
- Quick edit access

### Widget Editor (`/widgets/new`, `/widgets/:id/edit`)
- Tabbed interface (Design, Content, Targeting, Settings, Schedule)
- Real-time preview with device switching
- Color picker and typography controls
- Button and form builders
- Advanced targeting rules
- Scheduling options

### Analytics (`/analytics`)
- Comprehensive performance dashboard
- Interactive charts (impressions, clicks, conversions)
- Device breakdown analysis
- Top performing widgets
- Real-time activity feed
- Export capabilities

### Settings (`/settings`)
- Profile management with avatar upload
- Password change functionality
- Notification preferences
- Privacy and data controls
- Account deletion option

### Billing (`/billing`)
- Current subscription overview
- Usage limits and tracking
- Stripe integration for upgrades
- Billing history access
- Subscription management

### Admin Panel (`/admin`)
- System-wide analytics
- User management with actions
- Revenue and growth metrics
- Recent activity monitoring
- User search and filtering

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-800)
- **Body**: Regular (400) and Medium (500)
- **Small Text**: Light (300) for secondary info

### Components
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Consistent styling with validation states
- **Cards**: Clean borders with subtle shadows
- **Modals**: Centered overlays with backdrop blur

## 🚀 Performance Optimizations

- **Code Splitting** - Route-based lazy loading
- **Image Optimization** - Responsive images with lazy loading
- **Bundle Analysis** - Vite bundle analyzer for optimization
- **Caching** - API response caching with Axios
- **Debouncing** - Search input debouncing

## 🔒 Security Features

- **JWT Token Management** - Secure token storage and refresh
- **Route Protection** - Authentication and role-based guards
- **Input Validation** - Client-side form validation
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - API request tokens

## 📱 Responsive Design

- **Mobile First** - Designed for mobile, enhanced for desktop
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Friendly** - Large tap targets and gestures
- **Progressive Enhancement** - Works on all devices

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_URL=https://api.visitor2buy.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
VITE_NODE_ENV=production
```

### Deployment Platforms
- **Vercel** - Recommended for React apps
- **Netlify** - Great for static sites with forms
- **AWS S3 + CloudFront** - Scalable static hosting
- **Docker** - Containerized deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔄 API Integration

### Authentication Flow
1. User logs in with credentials
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in all API requests
5. Automatic logout on token expiration

### Error Handling
- Global error interceptor for API calls
- User-friendly error messages
- Retry logic for failed requests
- Offline detection and handling

### Data Flow
1. User actions trigger API calls
2. Loading states shown during requests
3. Success/error notifications displayed
4. Global state updated with new data
5. UI re-renders with updated information

## 🎯 Future Enhancements

- **Dark Mode** - Theme switching capability
- **Internationalization** - Multi-language support
- **PWA Features** - Offline functionality and push notifications
- **Advanced Charts** - More visualization options
- **Collaboration** - Team features and sharing
- **A/B Testing** - Built-in testing framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@visitor2buy.com or create an issue in the repository.