# Notification Service

Service responsible for managing notification channels and sending alerts to users for the Monitoring System.

## Features

- Multiple notification channels:
  - Email notifications
  - WhatsApp notifications (planned)
  - Telegram notifications (planned)
  - Slack notifications (planned)
  - Webhook notifications (planned)
- Channel verification
- Notification delivery tracking
- Notification filtering
- Test notifications

## API Endpoints

### Notification Channels

- `GET /api/channels` - List notification channels for the authenticated user
  - Headers: `Authorization: Bearer [token]`
  - Response: Array of channels

- `POST /api/channels` - Create a notification channel
  - Headers: `Authorization: Bearer [token]`
  - Request body: Channel configuration
  - Response: Created channel

- `GET /api/channels/:id` - Get a specific channel
  - Headers: `Authorization: Bearer [token]`
  - Response: Channel object

- `PUT /api/channels/:id` - Update a channel
  - Headers: `Authorization: Bearer [token]`
  - Request body: Updated channel configuration
  - Response: Updated channel

- `DELETE /api/channels/:id` - Delete a channel
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message

- `POST /api/channels/:id/verify` - Verify a channel with code
  - Headers: `Authorization: Bearer [token]`
  - Request body: `{ code: "VERIFICATION_CODE" }`
  - Response: Updated channel

- `POST /api/channels/:id/test` - Test a notification channel
  - Headers: `Authorization: Bearer [token]`
  - Response: Test result

### Notifications

- `GET /api/notifications` - Get recent notifications for the authenticated user
  - Headers: `Authorization: Bearer [token]`
  - Query parameters: `limit`
  - Response: Array of notifications

- `POST /api/notifications` - Create and send a notification
  - Request body: Notification data
  - Response: Created notification and delivery results

- `GET /api/notifications/:id` - Get a specific notification
  - Headers: `Authorization: Bearer [token]`
  - Response: Notification object

- `PUT /api/notifications/:id/read` - Mark a notification as read
  - Headers: `Authorization: Bearer [token]`
  - Response: Updated notification

- `PUT /api/notifications/read-all` - Mark all notifications as read
  - Headers: `Authorization: Bearer [token]`
  - Response: Success message with count

- `POST /api/notifications/bulk-delete` - Delete multiple notifications
  - Headers: `Authorization: Bearer [token]`
  - Request body: `{ ids: ["id1", "id2", ...] }`
  - Response: Success message with count