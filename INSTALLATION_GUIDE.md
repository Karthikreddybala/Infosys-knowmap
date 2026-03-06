# Installation & Setup Guide - Analytics Dashboard

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Installation](#backend-installation)
3. [Frontend Installation](#frontend-installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Database Setup (Optional)](#database-setup-optional)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Python**: Version 3.8 or higher (for NLP pipeline)
- **Git**: For version control

### Verification Commands
```bash
node --version    # Should be v16.0.0 or higher
npm --version     # Should be 8.0.0 or higher
python --version  # Should be 3.8 or higher
```

---

## Backend Installation

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- express (web framework)
- cors (cross-origin requests)
- axios (HTTP client)
- dotenv (environment variables)

### Step 3: Create Environment File
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
CORS_ORIGIN=http://localhost:5173

# Database Configuration (if using PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=knowledge_graph
DB_USER=postgres
DB_PASSWORD=your_password

# API Keys
ARXIV_API_KEY=optional
NEWS_API_KEY=optional
```

### Step 4: Verify Backend Structure
```
backend/
├── index.js
├── package.json
├── .env
└── src/
    ├── routes/
    │   ├── api.js (includes analytics endpoints)
    │   └── knowledgeGraph.js
    └── services/
        ├── apiService.js
        ├── analyticsService.js (NEW)
        ├── arxivService.js
        ├── newsService.js
        └── wikipediaService.js
```

---

## Frontend Installation

### Step 1: Navigate to Frontend Directory
```bash
cd frontend/react
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- react (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- lucide-react (icons)
- react-bootstrap (UI components)
- bootstrap (CSS framework)

### Step 3: Create Environment File
Create a `.env` file in `frontend/react`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Knowledge Graph Analytics
```

### Step 4: Verify Frontend Structure
```
frontend/react/src/
├── App.jsx (Updated with /analytics route)
├── pages/
│   ├── dashboard.jsx
│   ├── knowledge-graph.jsx
│   ├── analytics-dashboard.jsx (NEW)
│   ├── login.jsx
│   ├── register.jsx
│   └── css/
│       ├── dashboard.css
│       ├── knowledge-graph.css
│       ├── analytics-dashboard.css (NEW)
│       └── ...
└── components/
    ├── Navigation.jsx (NEW)
    └── css/
        └── navigation.css (NEW)
```

---

## Configuration

### Backend Configuration

#### 1. Update `backend/index.js`
Ensure the server is configured correctly:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './src/routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

#### 2. Update `backend/src/services/analyticsService.js`
The service is pre-configured to work with file-based storage. For production:

```javascript
// Option 1: PostgreSQL (recommended for production)
import pg from 'pg';
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

// Option 2: MongoDB
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);

// Option 3: Keep file-based for development
// Already configured - no changes needed
```

### Frontend Configuration

#### 1. Update `frontend/react/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost'
  }
})
```

#### 2. API Base URL
The frontend automatically uses the correct API URL from the `.env` file:

```javascript
// In components
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

---

## Running the Application

### Option 1: Run Both Servers Separately (Recommended)

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
```

#### Terminal 2 - Frontend Server
```bash
cd frontend/react
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in ... ms
  ➜  Local:   http://localhost:5173/
```

### Option 2: Run Both from Project Root (if configured)
```bash
npm run dev:all
```

### Option 3: Production Build

#### Build Frontend
```bash
cd frontend/react
npm run build
```

This creates optimized production files in `dist/` directory.

#### Build Backend
```bash
cd backend
npm run build  # If available
# or just use: npm start
```

---

## Verification

### Step 1: Verify Backend is Running
```bash
# Check if backend responds
curl http://localhost:5000/api/sources

# Expected response:
# {"success": true, "data": {"sources": [...], "message": "Available data sources"}}
```

### Step 2: Verify Frontend is Running
Open browser and navigate to:
```
http://localhost:5173
```

You should see the login page.

### Step 3: Test Analytics Endpoints

#### Get Metrics
```bash
curl http://localhost:5000/api/analytics/metrics
```

#### Get Performance Data
```bash
curl http://localhost:5000/api/analytics/performance
```

#### Get Accuracy Data
```bash
curl http://localhost:5000/api/analytics/accuracy
```

#### Submit Feedback
```bash
curl -X POST http://localhost:5000/api/analytics/feedback \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Great system!", "rating": 5}'
```

### Step 4: Access Analytics Dashboard
1. Start both servers (backend and frontend)
2. Open browser to `http://localhost:5173`
3. Login with your credentials
4. Click "📈 Analytics" in the navigation bar
5. You should see the analytics dashboard with metrics and feedback form

---

## Database Setup (Optional)

### PostgreSQL Setup (Recommended for Production)

#### 1. Install PostgreSQL
```bash
# Windows
# Download from: https://www.postgresql.org/download/windows/

# macOS
brew install postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
```

#### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE knowledge_graph;
CREATE USER kg_user WITH PASSWORD 'secure_password';
ALTER ROLE kg_user SET client_encoding TO 'utf8';
ALTER ROLE kg_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE kg_user SET default_transaction_deferrable TO on;
ALTER ROLE kg_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE knowledge_graph TO kg_user;
\q
```

#### 3. Update Backend Environment
```env
DATABASE_URL=postgresql://kg_user:secure_password@localhost:5432/knowledge_graph
```

#### 4. Create Tables
```sql
-- Feedback Table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    feedback TEXT NOT NULL,
    rating INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(500)
);

-- Metrics Table
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    total_estimate INTEGER,
    total_relations INTEGER,
    queue_length INTEGER,
    documents_processed_today INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline Performance Table
CREATE TABLE pipeline_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(255),
    success_rate FLOAT,
    avg_time INTEGER,
    processed INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Source Accuracy Table
CREATE TABLE source_accuracy (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(255),
    accuracy FLOAT,
    items_processed INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Setup (Alternative)

#### 1. Install MongoDB
```bash
# Docker (recommended)
docker pull mongo
docker run -d -p 27017:27017 --name mongodb mongo

# Or download from https://www.mongodb.com/try/download/community
```

#### 2. Create Collections
```javascript
// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_URI);

// Create collections
db.createCollection("feedback");
db.createCollection("metrics");
db.createCollection("pipeline_stages");
db.createCollection("source_accuracy");

// Create indexes
db.feedback.createIndex({ "timestamp": 1 });
db.metrics.createIndex({ "timestamp": 1 });
```

---

## Troubleshooting

### Issue: Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: CORS Errors
Check backend `CORS_ORIGIN` environment variable matches frontend URL.

### Issue: API Not Found (404)
Verify:
- Backend server is running on port 5000
- Routes are imported in `backend/index.js`
- API endpoints exist in `backend/src/routes/api.js`

### Issue: Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Verify Dashboard Works**: Navigate to `/analytics` and check all sections load
2. **Test Feedback**: Submit test feedback and verify it's saved
3. **Monitor Metrics**: Watch metrics auto-refresh every 30 seconds
4. **Configure Database** (optional): Set up persistent storage
5. **Customize**: Adjust colors, refresh intervals, and thresholds as needed

---

## Support & Documentation

- See [ANALYTICS_DASHBOARD_GUIDE.md](ANALYTICS_DASHBOARD_GUIDE.md) for feature details
- See [ANALYTICS_QUICKSTART.md](ANALYTICS_QUICKSTART.md) for quick reference
- Check browser DevTools (F12) for client-side errors
- Check backend console for server errors

---

## Checklist

Before going to production:

- [ ] Backend server running and accessible
- [ ] Frontend building without errors
- [ ] Analytics endpoints responding correctly
- [ ] Feedback submission working
- [ ] Database configured (PostgreSQL or MongoDB)
- [ ] Environment variables set correctly
- [ ] CORS headers configured
- [ ] SSL/HTTPS enabled (production)
- [ ] Error logging configured
- [ ] Performance monitoring in place

---

Happy monitoring! 📊
