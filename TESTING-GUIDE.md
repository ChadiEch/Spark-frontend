# Backend & Database Connectivity Testing Guide

This guide explains how to test the backend and database connectivity in the Winnerforce Spark application.

## Available Testing Methods

### 1. Web Interface Tests

#### Test Dashboard
- Navigate to `/test-index` in your browser
- Click on "Backend & Database Connectivity Test" link
- This will take you to the dedicated test page

#### Dedicated Test Page
- Direct URL: `/test/backend-connectivity`
- Shows detailed information about:
  - Backend server status
  - Database connection status
  - Database details (host, name, port, ping)
  - Backend system information (uptime, platform, architecture)

#### API Test Component
- Visible on the `/test-index` page
- Shows basic connectivity status for:
  - Backend connection
  - Database connection
  - API availability

### 2. Command Line Tests

#### Using npm script
```bash
npm run test-backend
```

This script will:
- Test connectivity to the backend through the frontend proxy
- Display database connection status
- Show detailed backend information

#### Manual testing with curl
```bash
# Test health endpoint directly (if backend is accessible)
curl http://localhost:5003/api/health

# Test through frontend proxy (when frontend is running)
curl http://localhost:8083/api/health
```

## What the Tests Check

### Backend Connectivity
- HTTP connection to the backend server
- Health endpoint response (`/api/health`)
- Server uptime and system information

### Database Connectivity
- Database connection status
- Database host, name, and port information
- Database ping results
- Connection error messages (if any)

## Expected Results

### Successful Connection
```
✅ Backend is reachable through frontend proxy
✅ Database is connected
   Host: localhost
   Name: winnerforce_db
   Port: 27017
   Ping: successful
```

### Database Not Connected
```
✅ Backend is reachable through frontend proxy
⚠️  Database is not connected
   Status: disconnected
   Message: Database connection not required for basic functionality
```

### Backend Unreachable
```
❌ Failed to connect to backend
   Error: Request timeout
```

## Troubleshooting

### Common Issues

1. **Backend not running**
   - Ensure the backend server is started: `node server.js` in the backend directory
   - Check the terminal output for the actual port being used

2. **Proxy configuration issues**
   - Verify the `vite.config.ts` proxy settings match the backend port
   - Restart the frontend development server after proxy changes

3. **Network/firewall issues**
   - Ensure ports are not blocked by firewall
   - Check if the backend and frontend are on compatible networks

4. **Database connection issues**
   - Verify MongoDB is running
   - Check database credentials in `.env` file
   - Ensure the database URI is correct

### Port Configuration

The application uses the following ports by default:
- Frontend development server: 8080+ (auto-increment if port is in use)
- Backend server: 5001+ (auto-increment if port is in use)
- Proxy configuration: Frontend proxies `/api` requests to backend

### Environment Variables

The test scripts respect the following environment variables:
- `FRONTEND_URL`: Base URL for frontend (default: http://localhost:8083)
- `BACKEND_URL`: Direct backend URL (for direct testing)

## Test Component Details

### Service: `testBackendConnection`
Located in: `src/services/testBackendConnection.ts`
- Makes HTTP request to `/api/health` endpoint
- Parses response to extract backend and database status
- Returns structured data with connection information

### Component: `ApiTest`
Located in: `src/components/ApiTest.tsx`
- Displays simple status indicators for backend and database
- Shows endpoint test results
- Provides re-run functionality

### Page: `TestBackendConnectivity`
Located in: `src/pages/TestBackendConnectivity.tsx`
- Dedicated page with comprehensive connection information
- Visual indicators for connection status
- Detailed system and database information
- Manual test trigger button

## Development Notes

### Adding New Tests
To add additional connectivity tests:
1. Extend the `testBackendConnection` service
2. Update the return type interface
3. Modify the components to display new information

### Customizing Test Behavior
- Adjust timeout values in the service files
- Modify display formatting in the components
- Add new endpoints to test in the service

This testing suite provides comprehensive visibility into the application's backend and database connectivity status, helping developers quickly identify and resolve connection issues.