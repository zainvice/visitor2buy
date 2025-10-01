# Visitor2Buy Backend

A powerful Node.js backend API for converting website visitors into customers, providing features similar to smartarget.online.

## Features

- **User Management** - Authentication, authorization, profiles
- **Campaign System** - Create and manage conversion campaigns
- **Analytics Engine** - Real-time tracking and reporting
- **Contact Management** - Lead capture and CRM functionality
- **File Upload** - Cloudinary integration for media management
- **Email System** - Automated notifications and marketing
- **Security** - JWT authentication, rate limiting, data validation

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- Cloudinary for media storage
- JWT for authentication
- Nodemailer for emails
- Bcrypt for password hashing
- Helmet for security headers
- Morgan for logging

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Cloudinary account (for file uploads)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
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

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at [http://localhost:5000](http://localhost:5000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Campaigns
- `GET /api/campaigns` - Get user campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/duplicate` - Duplicate campaign
- `POST /api/campaigns/:id/toggle-status` - Toggle campaign status

### Analytics
- `POST /api/analytics/track` - Track analytics event (public)
- `GET /api/analytics/campaigns/:id` - Get campaign analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

### Contacts
- `POST /api/contact/submit` - Submit contact form (public)
- `GET /api/contact` - Get user contacts
- `GET /api/contact/:id` - Get contact by ID
- `PUT /api/contact/:id` - Update contact
- `POST /api/contact/:id/notes` - Add note to contact
- `DELETE /api/contact/:id` - Delete contact

### File Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/avatar` - Upload user avatar
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/image/:publicId` - Delete image

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `PUT /api/users/avatar` - Update avatar
- `DELETE /api/users/account` - Delete account
- `GET /api/users/stats` - Get user statistics

## Database Models

### User
- Authentication and profile information
- Subscription management
- Preferences and settings

### Campaign
- Campaign configuration and content
- Targeting and scheduling rules
- Design and display settings
- Performance analytics

### Analytics
- Event tracking (impressions, clicks, conversions)
- Visitor information and metadata
- Time-series data for reporting

### Contact
- Lead information and form submissions
- Contact status and tags
- Notes and interaction history

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization

## Email System

- Welcome emails for new users
- Password reset functionality
- Campaign notifications
- Contact form auto-replies
- Bulk email capabilities

## File Management

- Cloudinary integration for image storage
- Automatic image optimization
- Multiple file upload support
- Secure file deletion

## Error Handling

- Centralized error handling middleware
- Detailed error logging
- User-friendly error messages
- Development vs production error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.