# Comprehensive Monitoring System

A complete web application for monitoring websites, services, and infrastructure components with real-time alerts and public status pages.

![Monitoring Dashboard](docs/screenshots/dashboard.png)

## Features

- **Multiple Monitoring Types**
  - Website Monitoring (HTTP/HTTPS)
  - SSL Certificate Monitoring
  - Domain Monitoring
  - Ping Monitoring
  - Port Monitoring
  - TCP Monitoring
  - Cron Job Monitoring
  - Keyword Monitoring

- **Real-time Notifications**
  - Email notifications
  - Telegram notifications
  - WhatsApp notifications
  - SMS notifications
  - Webhook integrations
  - Custom notification channels

- **Public Status Pages**
  - Branded public status pages
  - Custom domains support
  - Incident management and updates
  - Historical uptime data

- **Comprehensive Dashboard**
  - Real-time monitoring status
  - Detailed analytics and reports
  - Historical data visualization
  - Custom monitoring intervals

## Architecture

This application is built with a microservices architecture, consisting of:

- **API Gateway**: The entry point for all client requests
- **Auth Service**: Manages authentication, users, and permissions
- **Monitoring Service**: Core service for monitoring and checks
- **Notification Service**: Handles alerts and notifications
- **Status Page Service**: Manages public status pages
- **Frontend**: React-based web interface

## Tech Stack

- **Backend**
  - Node.js with Express.js
  - MongoDB for persistent storage
  - Redis for caching and queues
  - JWT for authentication

- **Frontend**
  - React.js with React Router
  - Context API for state management
  - Recharts for data visualization
  - Bootstrap for UI components

- **DevOps**
  - Docker and Docker Compose
  - Nginx for web server and proxying
  - GitHub Actions for CI/CD

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- MongoDB (for local development without Docker)
- Redis (for local development without Docker)

## Quick Start

### Using Docker (recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/sauufi/monitoring-system.git
   cd monitoring-system
   ```

2. Create environment configuration:
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Web interface: http://localhost
   - API: http://localhost:3000/api
   - MongoDB Express: http://localhost:8081
   - Redis Commander: http://localhost:8082

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/sauufi/monitoring-system.git
   cd monitoring-system
   ```

2. Create environment configuration:
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

3. Install dependencies for all services:
   ```bash
   # Frontend
   cd frontend
   npm install
   cd ..

   # API Gateway
   cd gateway
   npm install
   cd ..

   # Auth Service
   cd services/auth-service
   npm install
   cd ../..

   # Install dependencies for other services similarly
   ```

4. Start services individually (in separate terminals):
   ```bash
   # Start MongoDB and Redis
   docker-compose up -d mongo redis

   # Start Auth Service
   cd services/auth-service
   npm run dev
   
   # Start Monitoring Service
   cd services/monitoring-service
   npm run dev
   
   # Start Notification Service
   cd services/notification-service
   npm run dev
   
   # Start Status Page Service
   cd services/status-page-service
   npm run dev
   
   # Start API Gateway
   cd gateway
   npm run dev
   
   # Start Frontend
   cd frontend
   npm start
   ```

## Project Structure

```
monitoring-system/
├── .github/                     # GitHub specific files
│   └── workflows/               # GitHub Actions workflows
├── frontend/                    # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/                     # Source code
│   │   ├── api/                 # API services
│   │   ├── components/          # React components
│   │   ├── context/             # React Context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Utility functions
│   │   ├── App.js               # Main App component
│   │   └── index.js             # Entry point
│   └── package.json             # Frontend dependencies and scripts
├── gateway/                     # API Gateway
│   ├── app.js                   # Gateway application
│   └── package.json             # Gateway dependencies and scripts
├── services/                    # Backend microservices
│   ├── auth-service/            # Authentication service
│   ├── monitoring-service/      # Monitoring service
│   ├── notification-service/    # Notification service
│   └── status-page-service/     # Status page service
├── docker-compose.yml           # Docker compose for production
├── docker-compose.dev.yml       # Docker compose for development
├── .env.example                 # Example environment variables
└── README.md                    # This file
```

## API Documentation

### Auth Service

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify` - Verify JWT token

### Monitoring Service

- `GET /api/monitoring/monitors` - List all monitors
- `POST /api/monitoring/monitors` - Create a new monitor
- `GET /api/monitoring/monitors/:id` - Get monitor details
- `PUT /api/monitoring/monitors/:id` - Update a monitor
- `DELETE /api/monitoring/monitors/:id` - Delete a monitor
- `POST /api/monitoring/monitors/:id/check` - Run a check manually

### Notification Service

- `GET /api/notifications` - Get recent notifications
- `GET /api/notifications/channels` - List notification channels
- `POST /api/notifications/channels` - Create a notification channel
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

### Status Page Service

- `GET /api/status-pages` - List all status pages
- `POST /api/status-pages` - Create a new status page
- `GET /api/status-pages/:id` - Get status page details
- `PUT /api/status-pages/:id` - Update a status page
- `DELETE /api/status-pages/:id` - Delete a status page
- `GET /public/status-pages/:slug` - Get public status page

## Environment Variables

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `GATEWAY_PORT` | API Gateway port | `3000` |
| `AUTH_SERVICE_PORT` | Auth Service port | `3001` |
| `MONITORING_SERVICE_PORT` | Monitoring Service port | `3002` |
| `NOTIFICATION_SERVICE_PORT` | Notification Service port | `3003` |
| `STATUS_PAGE_SERVICE_PORT` | Status Page Service port | `3004` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017` |
| `JWT_SECRET` | Secret for JWT tokens | *required* |
| `SMTP_HOST` | SMTP server for email notifications | *required for email* |

See `.env.example` for a complete list of environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

This project uses ESLint and Prettier for code formatting. Run linting with:

```bash
npm run lint
```

### Testing

Run tests with:

```bash
npm test
```

## Deployment

### Docker Deployment

1. Build and tag the Docker images:
   ```bash
   docker-compose build
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

For manual deployment, follow these steps:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start each service on your server.

3. Configure Nginx or another web server to serve the frontend and proxy API requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)