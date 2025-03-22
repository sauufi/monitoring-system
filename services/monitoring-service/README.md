# Monitoring Service

Core service responsible for monitoring checks, data collection and scheduling for the Monitoring System.

## Features

- Multiple monitoring types:
  - Website Monitoring (HTTP/HTTPS)
  - SSL Certificate Monitoring
  - Domain Monitoring
  - Ping Monitoring
  - Port Monitoring
  - TCP Monitoring
  - Cron Job Monitoring
  - Keyword Monitoring
- Scheduled checks with configurable intervals
- Real-time status updates
- Event tracking and history
- Performance metrics
- Uptime calculation

## API Endpoints

### Monitor Management

- `GET /api/monitors` - List all monitors for the authenticated user
  - Headers: `Authorization: Bearer [token]`
  - Response: Array of monitors

- `POST /api/monitors` - Create a new monitor
  - Headers: `Authorization: Bearer [token]`
  - Request body: Monitor configuration
  - Response: Created monitor object

- `GET /api/monitors/:id` - Get a specific monitor
  - Headers: `Authorization: Bearer [token]`
  - Response: Monitor object

- `PUT /api/monitors/:id` - Update a monitor
  - Headers: `Authorization: Bearer [token]`
  - Request body: Updated monitor configuration
  - Response: Updated monitor object

- `DELETE /api/monitors/:id` - Delete a monitor
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message

### Monitor Events

- `GET /api/monitors/:id/events` - Get events for a monitor
  - Headers: `Authorization: Bearer [token]`
  - Query parameters: `limit`, `page`, `status`, `startDate`, `endDate`
  - Response: Events with pagination

- `GET /api/monitors/:id/uptime` - Get uptime statistics
  - Headers: `Authorization: Bearer [token]`
  - Query parameters: `days`
  - Response: Uptime percentage and history

- `POST /api/monitors/:id/test` - Run a test check
  - Headers: `Authorization: Bearer [token]`
  - Response: Check result

### Internal API (Service-to-Service)

- `GET /internal/monitors/:id` - Get monitor details
  - Response: Monitor details

- `GET /internal/monitors/:id/events` - Get monitor events
  - Query parameters: `limit`
  - Response: Events array

- `GET /internal/monitors/:id/uptime` - Get monitor uptime
  - Query parameters: `days`
  - Response: Uptime percentage

## Environment Variables

```
NODE_ENV=development
MONITORING_SERVICE_PORT=3002
MONGO_URI=mongodb://localhost:27017/monitoring-service
AUTH_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_URL=http://localhost:3003
USER_MONITOR_LIMIT=50
```

## Development

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

## Docker

### Build Image

```bash
docker build -t monitoring-service .
```

### Run Container

```bash
docker run -p 3002:3002 --env-file .env monitoring-service
```

## Project Structure

```
monitoring-service/
├── app.js                # Main application file
├── package.json          # Dependencies
├── models/               # Mongoose models
│   ├── Monitor.js        # Monitor model
│   └── Event.js          # Event model
├── routes/               # API routes
│   ├── monitors.js       # Monitor routes
│   └── internal.js       # Internal API routes
├── controllers/          # Business logic
│   └── monitoringController.js # Monitor checking logic
├── middleware/           # Middleware functions
│   └── auth.js           # Auth middleware
├── config/               # Configuration
│   └── config.js         # App configuration
├── utils/                # Utility functions
│   └── validation.js     # Input validation
└── tests/                # Unit and integration tests
    └── monitors.test.js  # Monitor API tests
```

## Monitor Types and Requirements

### Website Monitor
- Required fields: `url`
- Optional fields: `method`, `headers`, `body`, `expectedStatus`

### SSL Certificate Monitor
- Required fields: `domain`

### Domain Monitor
- Required fields: `domain`

### Ping Monitor
- Required fields: `ip` or `domain`

### Port Monitor
- Required fields: `ip` or `domain`, `port`

### TCP Monitor
- Required fields: `ip` or `domain`, `port`

### Cron Job Monitor
- Required fields: `url`

### Keyword Monitor
- Required fields: `url`, `keyword`