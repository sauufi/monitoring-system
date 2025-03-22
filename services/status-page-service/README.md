# Status Page Service

Service responsible for managing public status pages and incident tracking for the Monitoring System.

## Features

- Public status pages for services
- Custom domain support
- Theme customization
- Monitor grouping
- Incident management
- Maintenance scheduling
- Historical uptime data display

## API Endpoints

### Status Pages

- `GET /api/status-pages` - List status pages for the authenticated user
  - Headers: `Authorization: Bearer [token]`
  - Response: Array of status pages

- `POST /api/status-pages` - Create a status page
  - Headers: `Authorization: Bearer [token]`
  - Request body: Status page configuration
  - Response: Created status page

- `GET /api/status-pages/:id` - Get a specific status page
  - Headers: `Authorization: Bearer [token]`
  - Response: Status page object

- `PUT /api/status-pages/:id` - Update a status page
  - Headers: `Authorization: Bearer [token]`
  - Request body: Updated status page configuration
  - Response: Updated status page

- `DELETE /api/status-pages/:id` - Delete a status page
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message

### Status Page Monitors

- `POST /api/status-pages/:id/monitors` - Add a monitor to a status page
  - Headers: `Authorization: Bearer [token]`
  - Request body: Monitor configuration
  - Response: Created status page monitor

- `GET /api/status-pages/:id/monitors` - Get monitors for a status page
  - Headers: `Authorization: Bearer [token]`
  - Response: Array of monitors with details

- `PUT /api/status-pages/:pageId/monitors/:monitorId` - Update a monitor on a status page
  - Headers: `Authorization: Bearer [token]`
  - Request body: Updated monitor configuration
  - Response: Updated monitor

- `DELETE /api/status-pages/:pageId/monitors/:monitorId` - Remove a monitor from a status page
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message

### Incidents

- `POST /api/incidents` - Create an incident
  - Headers: `Authorization: Bearer [token]`
  - Request body: Incident data
  - Response: Created incident

- `GET /api/incidents/:id` - Get a specific incident
  - Headers: `Authorization: Bearer [token]`
  - Response: Incident object

- `PUT /api/incidents/:id` - Update an incident
  - Headers: `Authorization: Bearer [token]`
  - Request body: Updated incident data
  - Response: Updated incident

- `DELETE /api/incidents/:id` - Delete an incident
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message

- `POST /api/incidents/:id/updates` - Add an update to an incident
  - Headers: `Authorization: Bearer [token]`
  - Request body: Update data
  - Response: Updated incident

### Public API

- `GET /public/status-pages/:slug` - Get public status page by slug
  - Response: Status page data with monitors and incidents

- `GET /public/status-pages/:slug/incidents` - Get incidents for a public status page
  - Query parameters: `limit`, `page`
  - Response: Incidents with pagination

- `GET /public/status-pages/:slug/incidents/:id` - Get a specific incident for a public status page
  - Response: Incident object

- `GET /public/status-pages/:slug/status` - Get current status summary
  - Response: Status summary with components

### Internal API

- `POST /internal/incidents/auto` - Create or update an incident automatically
  - Request body: `{ monitorId, status, message }`
  - Response: Action results

- `GET /internal/status-pages/domain/:domain` - Get status page by custom domain
  - Response: Status page slug

- `GET /internal/status-pages` - Get basic info about all public status pages
  - Response: Array of status page basic info

## Environment Variables

```
NODE_ENV=development
STATUS_PAGE_SERVICE_PORT=3004
MONGO_URI=mongodb://localhost:27017/status-page-service
AUTH_SERVICE_URL=http://localhost:3001
MONITORING_SERVICE_URL=http://localhost:3002
MONITORING_SERVICE_INTERNAL_URL=http://monitoring-service:3002
CUSTOM_DOMAIN_ENABLED=true
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
docker build -t status-page-service .
```

### Run Container

```bash
docker run -p 3004:3004 --env-file .env status-page-service
```

## Project Structure

```
status-page-service/
├── app.js                # Main application file
├── package.json          # Dependencies
├── models/               # Mongoose models
│   ├── StatusPage.js     # Status page model
│   ├── StatusPageMonitor.js # Status page monitor model
│   └── Incident.js       # Incident model
├── routes/               # API routes
│   ├── statusPages.js    # Status page routes
│   ├── incidents.js      # Incident routes
│   ├── public.js         # Public API routes
│   └── internal.js       # Internal API routes
├── middleware/           # Middleware functions
│   └── auth.js           # Auth middleware
├── config/               # Configuration
│   └── config.js         # App configuration
├── utils/                # Utility functions
│   └── validation.js     # Input validation
└── tests/                # Unit and integration tests
```

## Status Page Components

A status page includes:

- Header with logo and description
- Current system status indicator
- Component status list with groups
- Active incidents section
- Resolved incidents history
- Overall uptime statistics
- Custom styling based on theme

## Incident Statuses

- `investigating` - Issue is being investigated
- `identified` - Root cause has been identified
- `monitoring` - Fix has been applied, monitoring for resolution
- `resolved` - Issue is resolved

## Impact Levels

- `minor` - Minimal impact on service
- `major` - Significant impact on service
- `critical` - Complete service outage