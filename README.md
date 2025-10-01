# Visitor2Buy - Complete Conversion Platform

A comprehensive web application for converting website visitors into customers, featuring campaign management, analytics, and lead capture - similar to smartarget.online functionality.

## 🚀 Project Overview

Visitor2Buy is a full-stack application that helps businesses convert website visitors into customers through targeted campaigns, popups, banners, and analytics tracking.

### Key Features

- **Campaign Management** - Create and manage conversion campaigns (popups, banners, slide-ins)
- **Real-time Analytics** - Track impressions, clicks, conversions, and performance metrics
- **Lead Management** - Capture and manage contact information and leads
- **User Authentication** - Secure login, registration, and user management
- **File Upload** - Cloudinary integration for image and media management
- **Email System** - Automated notifications and marketing emails
- **Widget Integration** - Easy-to-embed JavaScript widget for websites
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (`visitor2buy-be`)
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Cloudinary** for media storage
- **JWT** authentication
- **Nodemailer** for email functionality
- **Security** features (rate limiting, CORS, helmet)

### Frontend (`visitor2boy-fe`)
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for analytics visualization
- **React Hook Form** for form handling

## 📁 Project Structure

```
/workspace/
├── visitor2buy-be/          # Backend API
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── config/              # Configuration files
│   ├── utils/               # Utility functions
│   ├── public/              # Static files (widget)
│   └── server.js            # Main server file
│
└── visitor2boy-fe/          # Frontend React app
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── context/         # React contexts
    │   ├── types/           # TypeScript types
    │   └── App.tsx          # Main app component
    └── public/              # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Cloudinary account (optional, for file uploads)

### Backend Setup

1. Navigate to backend directory:
```bash
cd visitor2buy-be
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd visitor2boy-fe
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with:
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - Get user campaigns
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Analytics
- `POST /api/analytics/track` - Track events (public)
- `GET /api/analytics/dashboard` - Get dashboard data

### Contacts
- `POST /api/contact/submit` - Submit contact form (public)
- `GET /api/contact` - Get user contacts

### File Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/avatar` - Upload user avatar

## 🔧 Widget Integration

To integrate Visitor2Buy on your website:

1. Add the configuration script:
```html
<script>
window.Visitor2BuyConfig = {
  campaigns: [
    {
      _id: 'your-campaign-id',
      type: 'popup',
      content: {
        headline: 'Special Offer!',
        description: 'Get 50% off today!',
        buttonText: 'Claim Now'
      },
      settings: {
        delay: 5 // Show after 5 seconds
      }
    }
  ]
};
</script>
```

2. Load the widget:
```html
<script src="http://localhost:5000/static/widget.js"></script>
```

## 🎯 Demo

Visit `http://localhost:5000/static/demo.html` to see the widget in action with a sample campaign.

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visitor2buy
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Visitor2Buy
```

## 🛠️ Development

### Running Tests
```bash
# Backend
cd visitor2buy-be
npm test

# Frontend
cd visitor2boy-fe
npm test
```

### Building for Production
```bash
# Backend
cd visitor2buy-be
npm start

# Frontend
cd visitor2boy-fe
npm run build
```

## 📈 Features Implemented

✅ **User Authentication & Management**
- Registration, login, password reset
- JWT token authentication
- User profiles and preferences

✅ **Campaign System**
- Create, edit, delete campaigns
- Multiple campaign types (popup, banner, slide-in)
- Targeting options (device, page, referrer)
- Scheduling and frequency controls

✅ **Analytics & Tracking**
- Real-time event tracking
- Performance metrics (CTR, conversion rates)
- Dashboard with charts and insights
- Campaign-specific analytics

✅ **Contact Management**
- Lead capture forms
- Contact status tracking
- Notes and tags system
- Export functionality

✅ **File Management**
- Cloudinary integration
- Image upload and optimization
- Avatar management

✅ **Widget System**
- Embeddable JavaScript widget
- Campaign display logic
- Event tracking
- Responsive design

✅ **Security & Performance**
- Rate limiting
- CORS configuration
- Input validation
- Error handling

## 🔮 Future Enhancements

- A/B testing functionality
- Advanced targeting options
- Email marketing integration
- Multi-language support
- Advanced analytics and reporting
- Team collaboration features
- API webhooks
- Mobile app

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Visitor2Buy** - Transform your website visitors into customers! 🚀