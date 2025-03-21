# Comprehensive Monitoring System

A complete web application for monitoring websites, SSL certificates, domains, ping, ports, TCP connections, cron jobs, and keywords. Includes a public status page and multiple notification channels.

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

- **Notifications**

  - Email notifications
  - WhatsApp notifications
  - Telegram notifications

- **Status Pages**

  - Public status pages for transparency
  - Custom domains support
  - Incident management

- **Dashboard**
  - Comprehensive analytics
  - Historical data and graphs
  - Uptime statistics

## System Architecture

This application uses a microservices architecture with the following components:

- **API Gateway**: Entry point for all client requests, handles routing to appropriate services
- **Auth Service**: Manages authentication, user accounts, and permissions
- **Monitoring Service**: Core service that handles all monitoring checks
- **Notification Service**: Manages notification channels and sending alerts
- **Status Page Service**: Handles public status pages and incident management
- **Frontend**: React-based web interface

## Technology Stack

- **Backend**

  - Node.js with Express.js
  - MongoDB for data storage
  - Redis for caching and message queuing
  - JWT for authentication

- **Frontend**

  - React.js for UI components
  - React Router for navigation
  - Recharts for data visualization
  - Bootstrap for styling

- **DevOps**
  - Docker and Docker Compose for containerization
  - Nginx for serving the frontend
  - Let's Encrypt for SSL certificates

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for development)
- MongoDB (for development without Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sauufi/monitoring-system.git
   cd monitoring-system
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

4. Access the application at:
   ```
   http://localhost:3000
   ```

### Development Setup

1. Install dependencies for all services:

   ```bash
   # For each service
   cd services/auth-service
   npm install

   # ... repeat for other services and frontend
   ```

2. Run services individually during development:

   ```bash
   # For each service
   cd services/auth-service
   npm run dev

   # For frontend
   cd frontend
   npm start
   ```

## Configuration

### Notification Setup

#### Email Notifications

1. Update SMTP settings in the `.env` file:
   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_email_password
   EMAIL_FROM=monitoring@example.com
   ```

#### WhatsApp Notifications

1. Create a WhatsApp Business API account
2. Configure WhatsApp API tokens in the `.env` file:
   ```
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   ```

#### Telegram Notifications

1. Create a Telegram bot using BotFather
2. Configure the Telegram bot token in the Notification Service

## API Documentation

### Auth Service

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/profile` - Get current user profile

### Monitoring Service

- `GET /api/monitoring/monitors` - List all monitors
- `POST /api/monitoring/monitors` - Create a new monitor
- `GET /api/monitoring/monitors/:id` - Get monitor details
- `PUT /api/monitoring/monitors/:id` - Update a monitor
- `DELETE /api/monitoring/monitors/:id` - Delete a monitor
- `GET /api/monitoring/monitors/:id/events` - Get monitor events

### Notification Service

- `GET /api/notifications/channels` - List notification channels
- `POST /api/notifications/channels` - Create a notification channel
- `GET /api/notifications` - Get recent notifications

### Status Page Service

- `GET /api/status-pages` - List status pages
- `POST /api/status-pages` - Create a status page
- `GET /public/status-pages/:slug` - Get public status page

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
