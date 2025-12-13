# Quick Setup Guide

## Prerequisites
- Node.js v18 or higher
- npm or yarn

## Initial Setup

1. **Clone the repository** (if not already done)

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   Or manually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env if needed (default should work)
   ```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000

### Testing

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

## Creating Admin User

To create an admin user, you can:

1. Register normally through the UI
2. Manually update the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'your_username';
   ```

Or use the API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"admin"}'
```

## Troubleshooting

### Database Issues
- Delete `backend/sweet_shop.db` and restart the server to reset the database

### Port Already in Use
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env accordingly

### CORS Issues
- Ensure backend CORS is configured correctly
- Check that frontend is using the correct API URL

