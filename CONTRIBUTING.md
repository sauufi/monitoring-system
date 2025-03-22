# Contributing to Monitoring System

Thank you for considering contributing to the Monitoring System! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by its Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/yourusername/monitoring-system/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/monitoring-system/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- **Check if the enhancement has already been suggested** by searching on GitHub under [Issues](https://github.com/yourusername/monitoring-system/issues).
- If it hasn't, [create a new issue](https://github.com/yourusername/monitoring-system/issues/new) with a clear title and description of the suggested enhancement.

### Pull Requests

1. **Fork the repository** to your GitHub account.
2. **Clone your fork** to your local machine.
3. **Create a new branch** for your feature or bugfix: `git checkout -b feature/your-feature-name` or `git checkout -b fix/your-bugfix-name`.
4. **Make your changes** and commit them with clear, descriptive commit messages.
5. **Push your branch** to your fork on GitHub.
6. **Submit a pull request** to the original repository.

## Development Workflow

### Setting Up Development Environment

1. Make sure you have the following installed:
   - Node.js (v16 or later)
   - npm or yarn
   - Docker and Docker Compose
   - MongoDB (if not using Docker)

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/monitoring-system.git
   cd monitoring-system
   ```

3. Install dependencies for all services:
   ```bash
   # For each service
   cd services/auth-service
   npm install

   # ... repeat for other services and frontend
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables.

5. Start the services using Docker Compose for development:
   ```bash
   docker-compose up -d
   ```

### Code Style Guidelines

- We use ESLint and Prettier for code formatting and style checking.
- Run `npm run lint` to check your code style.
- Run `npm run format` to automatically format your code.

### Testing

- Write tests for any new features or bug fixes.
- Run `npm test` to execute the test suite.
- Make sure all tests pass before submitting a pull request.

## Microservices Architecture

Our application is divided into several microservices:

- **API Gateway**: Entry point for all client requests, handles routing to appropriate services
- **Auth Service**: Manages authentication, user accounts, and permissions
- **Monitoring Service**: Core service that handles all monitoring checks
- **Notification Service**: Manages notification channels and sending alerts
- **Status Page Service**: Handles public status pages and incident management
- **Frontend**: React-based web interface

When making changes, ensure that you update only the services that need to be changed. If your changes affect multiple services, consider the impact on the overall system.

## Documentation

- Update the documentation to reflect any changes you make.
- Add comments to your code to explain complex logic.
- Add or update tests to reflect your changes.

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to the Monitoring System!