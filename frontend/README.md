# Monitoring System Frontend

React-based frontend application for the Comprehensive Monitoring System.

## Features

- Dashboard with monitoring statistics and charts
- Monitor management (create, view, edit, delete)
- Status page management
- Notification settings
- User authentication and profile management
- Responsive design for desktop and mobile devices

## Technology Stack

- React.js for UI components
- React Router for navigation
- Recharts for data visualization
- Axios for API requests
- Bootstrap for UI framework
- Formik and Yup for form handling and validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create `.env.local` file:

```
REACT_APP_API_URL=http://localhost:3000
```

3. Start development server:

```bash
npm start
# or
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `build` directory.

## Docker

### Development

```bash
docker build -f Dockerfile.dev -t monitoring-frontend-dev .
docker run -p 80:3000 monitoring-frontend-dev
```

### Production

```bash
docker build -t monitoring-frontend .
docker run -p 80:80 monitoring-frontend
```

## Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── index.html             # HTML template
│   ├── favicon.ico            # Favicon
│   └── manifest.json          # Web app manifest
├── src/                       # Application source code
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   ├── monitors/          # Monitor management components
│   │   ├── notifications/     # Notification components
│   │   ├── settings/          # Settings components
│   │   └── status-page/       # Status page components
│   ├── context/               # React contexts
│   │   └── AuthContext.js     # Authentication context
│   ├── utils/                 # Utility functions
│   │   ├── formatUtils.js     # Formatting helpers
│   │   ├── PrivateRoute.js    # Route protection
│   │   └── setAuthToken.js    # Auth token helper
│   ├── App.js                 # Main application component
│   ├── index.js               # Application entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies and scripts
├── .env.development           # Development environment variables
└── .env.production            # Production environment variables
```

## Customization

### Themes

The application uses Bootstrap 5 for styling. To customize the theme:

1. Edit global CSS variables in `src/index.css`
2. Override Bootstrap variables before import

### API Integration

The app is configured to work with the Monitoring System backend API. If you need to change the API URL:

1. Update the `REACT_APP_API_URL` in the `.env` file
2. For more complex changes, modify the axios interceptors in `src/index.js`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Contributing

1. Follow the project code style and structure
2. Create components according to the established patterns
3. Write tests for new features
4. Update documentation as needed