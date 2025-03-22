# Microservices

This directory contains the backend microservices that power the Monitoring System:

## Services Overview

### 1. Auth Service

- **Directory**: `auth-service/`
- **Port**: 3001
- **Description**: Handles user authentication, registration, and profile management.
- **Key Features**:
  - JWT-based authentication
  - User registration and verification
  - Password reset functionality
  - Role-based access control

### 2. Monitoring Service

- **Directory**: `monitoring-service/`
- **Port**: 3002
- **Description**: Core service responsible for all monitoring checks and data collection.
- **Key Features**:
  - Multiple monitoring types (website, SSL, domain, ping, etc.)
  - Scheduled monitoring jobs
  - Event tracking and history
  - Real-time status updates

### 3. Notification Service

- **Directory**: `notification-service/`
- **Port**: 3003
- **Description**: Manages notification preferences and sending alerts through various channels.
- **Key Features**:
  - Multiple notification channels (email, WhatsApp, Telegram)
  - Customizable notification templates
  - Notification throttling
  - Delivery status tracking

### 4. Status Page Service

- **Directory**: `status-page-service/`
- **Port**: 3004
- **Description**: Handles public status pages and incident management.
- **Key Features**:
  - Public status page generation
  - Incident creation and updates
  - Custom branding options
  - Historical uptime data

## Development

Each service follows a similar structure:

```
service-name/
├── app.js                # Main application file
├── package.json          # Dependencies
├── models/               # Data models
├── routes/               # API routes
├── middleware/           # Middleware functions
├── config/               # Configuration
├── utils/                # Utility functions
└── tests/                # Unit and integration tests
```

### Running Services Individually

```bash
cd services/[service-name]
npm install
npm run dev
```

### Running with Docker

Use Docker Compose for development:

```bash
docker-compose -f docker-compose.dev.yml up [service-name]
```

## API Documentation

Each service exposes its own API endpoints. For detailed API documentation:

1. See the README.md in each service directory
2. Check route handlers in `routes/` directories
3. Refer to the main project documentation