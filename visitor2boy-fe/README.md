# Visitor2Buy Frontend

A modern React TypeScript application for converting website visitors into customers, similar to smartarget.online functionality.

## Features

- **User Authentication** - Login, register, password reset
- **Campaign Management** - Create and manage conversion campaigns
- **Analytics Dashboard** - Real-time performance tracking
- **Contact Management** - Lead capture and management
- **Responsive Design** - Works on desktop and mobile
- **Material-UI** - Modern, accessible UI components

## Tech Stack

- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- React Hook Form for forms
- Recharts for analytics visualization
- React Hot Toast for notifications

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

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
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Navbar, Sidebar)
├── pages/              # Page components
├── services/           # API service functions
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## API Integration

The frontend communicates with the Visitor2Buy backend API. Key services include:

- **AuthService** - User authentication
- **CampaignService** - Campaign CRUD operations
- **AnalyticsService** - Performance tracking
- **ContactService** - Lead management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.