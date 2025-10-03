# Visitor2Buy Backend API

A comprehensive customer engagement platform backend that allows businesses to create and manage conversion widgets, popups, and customer engagement tools.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role management
- **Project Management** - Multi-domain project support with embed codes
- **Widget System** - Create popups, banners, floating buttons, chat widgets, etc.
- **Advanced Targeting** - Device, URL, time-based, scroll, and exit-intent targeting
- **Real-time Analytics** - Track impressions, clicks, conversions, and form submissions
- **Payment Integration** - Stripe-powered subscription management
- **Media Management** - Cloudinary integration for image uploads
- **Admin Panel** - Comprehensive admin tools for user and system management

### Widget Types Supported
- Popups & Modals
- Notification Bars
- Floating Buttons
- Chat Widgets
- Exit-Intent Popups
- Slide-in Widgets
- Custom CTAs

### Targeting Options
- **Device Targeting** - Desktop, Mobile, Tablet
- **Page Targeting** - URL patterns, include/exclude rules
- **Geographic Targeting** - Country-based targeting
- **Behavioral Targeting** - Time on site, visit count, scroll percentage
- **Exit Intent** - Detect when users are about to leave
- **Time-based** - Schedule widgets for specific times/days

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- Email service (Gmail/SendGrid for notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visitor2buy-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/visitor2buy
   JWT_SECRET=your-jwt-secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "company": "Acme Corp",
  "website": "https://acme.com"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Project Management

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Website",
  "description": "Main company website",
  "domain": "example.com",
  "allowedDomains": ["www.example.com", "app.example.com"]
}
```

#### Get Embed Code
```http
GET /api/projects/:id/embed-code
Authorization: Bearer <token>
```

### Widget Management

#### Create Widget
```http
POST /api/widgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "project": "project_id",
  "name": "Welcome Popup",
  "type": "popup",
  "content": {
    "headline": "Welcome to our site!",
    "description": "Get 10% off your first order",
    "buttons": [{
      "text": "Get Discount",
      "action": "url",
      "value": "https://example.com/discount"
    }]
  },
  "targeting": {
    "devices": ["desktop", "mobile"],
    "scrollPercentage": 50,
    "exitIntent": true
  },
  "triggers": {
    "delay": 5,
    "frequency": "once"
  }
}
```

### Analytics

#### Track Event (Public Endpoint)
```http
POST /api/embed/track
Content-Type: application/json

{
  "widgetId": "widget_id",
  "projectId": "project_id",
  "event": "impression",
  "sessionId": "session_id",
  "metadata": {
    "page": "https://example.com/page"
  }
}
```

#### Get Widget Analytics
```http
GET /api/analytics/widgets/:id?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Payment Integration

#### Create Checkout Session
```http
POST /api/payments/create-checkout-session
Authorization: Bearer <token>
```

#### Get Subscription Status
```http
GET /api/payments/subscription-status
Authorization: Bearer <token>
```

## 🎯 Widget Embed System

### How It Works

1. **Project Setup** - Create a project and get an embed code
2. **Widget Creation** - Design widgets with targeting rules
3. **Embed Script** - Add the embed script to your website
4. **Real-time Delivery** - Widgets are delivered based on targeting rules
5. **Analytics Tracking** - All interactions are automatically tracked

### Embed Script Example
```html
<!-- Add this to your website's <head> section -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-api-domain.com/scripts/YOUR_EMBED_CODE.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

### Widget Targeting Examples

#### Time-based Targeting
```javascript
{
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5], // Monday to Friday
    "timeRange": {
      "start": "09:00",
      "end": "17:00"
    }
  }
}
```

#### Behavioral Targeting
```javascript
{
  "targeting": {
    "scrollPercentage": 75,     // Show after 75% scroll
    "timeOnSite": { "min": 30 }, // Show after 30 seconds
    "exitIntent": true,          // Show on exit intent
    "visitCount": { "min": 2 }   // Show on 2nd visit
  }
}
```

#### Page Targeting
```javascript
{
  "targeting": {
    "pages": {
      "include": ["/products", "/pricing"],
      "exclude": ["/checkout", "/admin"]
    }
  }
}
```

## 🏗️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  subscription: {
    plan: 'free' | 'pro',
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    isActive: Boolean,
    limits: {
      widgets: Number,
      projects: Number,
      pageViews: Number
    }
  }
}
```

### Project Model
```javascript
{
  user: ObjectId,
  name: String,
  domain: String,
  allowedDomains: [String],
  embedCode: String (unique),
  apiKey: String (unique),
  settings: {
    timezone: String,
    trackingEnabled: Boolean,
    gdprCompliant: Boolean
  }
}
```

### Widget Model
```javascript
{
  user: ObjectId,
  project: ObjectId,
  name: String,
  type: 'popup' | 'banner' | 'floating-button' | 'chat-widget',
  status: 'draft' | 'active' | 'paused',
  targeting: {
    devices: [String],
    pages: { include: [String], exclude: [String] },
    scrollPercentage: Number,
    exitIntent: Boolean,
    timeOnSite: { min: Number, max: Number }
  },
  content: {
    headline: String,
    description: String,
    buttons: [{
      text: String,
      action: String,
      value: String
    }],
    form: {
      enabled: Boolean,
      fields: [Object]
    }
  },
  design: {
    colors: Object,
    typography: Object,
    customCSS: String
  }
}
```

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers
- **Password Hashing** with bcrypt
- **Role-based Access Control**

## 📊 Analytics & Tracking

### Event Types
- **impression** - Widget shown to user
- **click** - User clicked on widget/button
- **conversion** - User completed desired action
- **submission** - Form submitted
- **close** - Widget closed by user

### Analytics Aggregation
- Real-time event tracking
- Daily/weekly/monthly summaries
- Conversion rate calculations
- User behavior analysis
- Geographic analytics

## 💳 Subscription Plans

### Free Plan
- 3 widgets maximum
- 1 project
- 1,000 page views/month
- Visitor2Buy branding

### Pro Plan
- Unlimited widgets
- Unlimited projects
- Unlimited page views
- Remove branding
- Priority support
- Advanced analytics

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure-production-secret
API_URL=https://api.visitor2buy.com
CLIENT_URL=https://app.visitor2buy.com
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.visitor2buy.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Project Structure
```
visitor2buy-be/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Utility functions
├── public/          # Static files
├── logs/            # Log files
└── server.js        # Main server file
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@visitor2buy.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete widget management system
- Stripe integration
- Analytics tracking
- Admin panel
- Multi-project support