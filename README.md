# KnowMap Authentication System

A complete login/register flow with dashboard access built with React frontend and Node.js/PostgreSQL backend.

## Quick Start

### 1. Backend Setup

```bash
cd Infosys-knowmap/backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with your database configuration:

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=knowmap_db
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
```

### 3. Start Backend Server

```bash
cd Infosys-knowmap/backend
npm run dev
```

### 4. Frontend Setup

```bash
cd Infosys-knowmap/frontend/knowmap
npm install
npm run dev
```

## Project Structure

### Backend (`/backend`)
- `src/models/user.js` - PostgreSQL user model with bcrypt hashing
- `src/routes/auth.js` - Authentication API endpoints
- `src/utils/valid.js` - Input validation functions
- `index.js` - Express server with database initialization

### Frontend (`/frontend/knowmap`)
- `src/context/AuthContext.js` - Global authentication state
- `src/components/ProtectedRoute.js` - Route protection logic
- `src/templates/login.jsx` - Login form component
- `src/templates/register.jsx` - Registration form component
- `src/templates/dashboard.jsx` - Protected dashboard component
- `src/App.jsx` - Main routing configuration

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/verify` - Verify authentication

## Features

- ✅ User registration with email, username, and password
- ✅ User login with email/username and password
- ✅ Password hashing with bcrypt
- ✅ Form validation (client and server-side)
- ✅ Protected routes (dashboard only accessible when authenticated)
- ✅ Responsive design with professional styling
- ✅ Loading states and error handling
- ✅ User session management

## Troubleshooting

### Common Issues:

1. **Frontend not loading**: Make sure you've run `npm install` in the frontend directory
2. **Backend not starting**: Check your database connection in `.env` file
3. **CORS errors**: Backend includes CORS middleware, but check if frontend is running on correct port
4. **Database connection**: Ensure PostgreSQL is running and credentials are correct

### Debug Steps:

1. Start backend server and check console for any errors
2. Start frontend server and check browser console for errors
3. Test API endpoints with Postman or curl
4. Verify database connection and table creation

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

- Backend: Node.js with Express, PostgreSQL with pg library
- Frontend: React with Vite, React Router for navigation
- Authentication: Session-based (no JWT tokens as requested)
- Styling: CSS modules with responsive design