# Auth Service

Authentication and user management service for the Monitoring System.

## Features

- User registration and authentication
- JWT-based authentication
- Password reset functionality
- Email verification
- User profile management
- Role-based access control

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
  - Request body: `{ name, email, password }`
  - Response: `{ success, message }`

- `POST /api/login` - Login user and get token
  - Request body: `{ email, password }`
  - Response: `{ success, token, user }`

- `POST /api/verify` - Verify JWT token (internal API for other services)
  - Request body: `{ token }`
  - Response: `{ valid, user }`

### User Management

- `GET /api/profile` - Get user profile
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ success, data }`

- `PUT /api/profile` - Update user profile
  - Headers: `Authorization: Bearer [token]`
  - Request body: `{ name, email }`
  - Response: `{ success, data }`

### Password Management

- `POST /api/password/change` - Change password
  - Headers: `Authorization: Bearer [token]`
  - Request body: `{ currentPassword, newPassword }`
  - Response: `{ success, message }`

- `POST /api/password/forgot` - Request password reset
  - Request body: `{ email }`
  - Response: `{ success, message }`

- `POST /api/password/reset/:token` - Reset password with token
  - Request body: `{ password }`
  - Response: `{ success, message }`

### Email Verification

- `GET /api/verify/:token` - Verify email with token
  - Response: `{ success, message }`

## Environment Variables

```
NODE_ENV=development
AUTH_SERVICE_PORT=3001
MONGO_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
EMAIL_FROM=no-reply@monitoring-system.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:3000
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
docker build -t auth-service .
```

### Run Container

```bash
docker run -p 3001:3001 --env-file .env auth-service
```

## Project Structure

```
auth-service/
├── app.js                # Main application file
├── package.json          # Dependencies
├── models/               # Mongoose models
│   └── User.js           # User model
├── routes/               # API routes
│   └── auth.js           # Auth routes
├── middleware/           # Middleware functions
│   └── auth.js           # Auth middleware
├── config/               # Configuration
│   └── config.js         # App configuration
├── utils/                # Utility functions
│   └── validation.js     # Input validation
└── tests/                # Unit and integration tests
    └── auth.test.js      # Auth API tests
```