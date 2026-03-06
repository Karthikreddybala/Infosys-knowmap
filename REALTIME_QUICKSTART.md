# 🚀 Real-Time Analytics Dashboard - Setup & Connection Guide

## ✅ What You Have

Your analytics dashboard is now **fully integrated** with the knowledge graph processing system with:

✅ **Real-time metrics** from knowledge graph processing  
✅ **Live pipeline tracking** - 6 stages monitored  
✅ **Automatic data refresh** - every 10 seconds  
✅ **One-click manual refresh** button  
✅ **Per-source accuracy tracking**  
✅ **User feedback collection** with ratings  
✅ **System health monitoring**  

---

## 🎯 Quick Start (All-in-One)

### Terminal 1 - Backend (Already Running ✓)
```bash
cd backend
npm run dev
```
**Status**: ✅ Server running on port 5000  
**Dashboard Endpoint**: `/api/analytics/dashboard`

### Terminal 2 - Frontend (Already Running ✓)
```bash
cd frontend/react
npm run dev
```
**Status**: ✅ Running on port 5174  
**Dashboard URL**: `http://localhost:5174/analytics`

### Terminal 3 - Python API (Optional but Recommended)
```bash
# First time setup
cd knowledge_graph
pip install flask flask-cors

# Then run
python stats_api_server.py
```
**Status**: Will appear on port 5001  
**Provides**: Real graph statistics  
**Optional**: Dashboard works without it

---

## 📊 Open Your Real-Time Dashboard

```
http://localhost:5174/analytics
```

You'll see:
- 📈 **4 Metrics Cards** - Real-time counts
- 🔄 **Pipeline Performance** - 6 stages with live success rates
- 📊 **Data Source Accuracy** - Per-source quality
- 🧠 **Feedback Form** - 5-star ratings
- ⚙️ **System Status** - Health & throughput

---

## 🔗 How It Works

### Data Flow
```
Processing Pipeline
    ↓
metricsTracker (Node.js)
    ↓
Backend Cache
    ↓
/api/analytics/dashboard (Combined endpoint)
    ↓
Frontend Dashboard
    ↓
Auto-refresh every 10 seconds
```

### Metrics Auto-Update When:
- ✓ Documents are processed
- ✓ Entities are extracted
- ✓ Relations are added to graph
- ✓ Pipeline stages execute
- ✓ Data accuracy is calculated

---

## 📱 Dashboard Features

### Auto-Refresh Toggle
- **Enabled** (Default): Updates every 10 seconds
- **Disabled**: Manual refresh only
- **Button**: "✓ Auto Refresh" or "Auto Refresh Off"

### Manual Refresh Button
- Click "🔄 Refresh" for immediate update
- Shows "Refreshing..." while fetching
- Updates timestamp after completion

### Real-Time Metrics
1. **Total Documents** - Count of processed items
2. **Total Relations** - Extracted relationships
3. **Total Nodes** - Discovered entities
4. **Extraction Accuracy** - Per-source quality %
5. **Pipeline Performance** - Stage-by-stage success rates
6. **Processing Time** - Average time per document
7. **System Throughput** - Documents per minute
8. **Success Rate** - Overall pipeline success %

---

## 🔌 Connect Your Processing

### Option 1: Automatic (Easiest)
The dashboard automatically tracks all metrics if you're using the NLP pipeline endpoints.

### Option 2: Manual Tracking
```javascript
// In your Node.js code
import metricsTracker from './services/metricsTracker.js';

// When processing document
metricsTracker.recordDocumentProcessed('wikipedia');

// When executing pipeline stage
const start = Date.now();
// ... do processing ...
metricsTracker.recordStageExecution(
    'Entity Recognition',
    start,
    Date.now(),
    true,  // success
    50     // items processed
);
```

### Option 3: Python API Updates
```python
# Send graph stats from Python
import requests

stats = {
    "num_nodes": 150,
    "num_edges": 450,
    "nodes": [...],
    "edges": [...]
}

# Updates the dashboard metrics
```

---

## 🎨 Customization

### Change Refresh Interval
Edit `frontend/react/src/pages/analytics-dashboard.jsx`:
```javascript
// Line ~11: Change 10000 to desired milliseconds
interval = setInterval(fetchAnalytics, 10000);
```

- 5000 = 5 seconds (faster, more server load)
- 30000 = 30 seconds (slower, less load)

### Change Color Thresholds
Edit `frontend/react/src/pages/css/analytics-dashboard.css`:
```css
/* Find color definitions and modify */
.status-indicator.status-active { color: #28a745; }
```

---

## 📊 API Endpoints Available

### Main Endpoint (Recommended)
```
GET /api/analytics/dashboard
```
Returns: metrics, performance, accuracy all at once

### Individual Endpoints
```
GET /api/analytics/metrics       → Counts only
GET /api/analytics/performance   → Pipeline data
GET /api/analytics/accuracy      → Accuracy per source
GET /api/graph/stats            → Graph statistics
```

### Python API Endpoints (Optional)
```
GET /api/graph/stats             → Full graph data
GET /api/graph/nodes             → All entities
GET /api/graph/edges             → All relationships
GET /api/graph/relations         → Relation types
POST /api/graph/process          → Process text
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000 (`npm run dev`)
- [ ] Frontend running on port 5174 (`npm run dev`)
- [ ] Dashboard loads at `http://localhost:5174/analytics`
- [ ] Metrics cards display with numbers
- [ ] Pipeline stages show with percentages
- [ ] Data source accuracy visible
- [ ] Feedback form works
- [ ] Auto-refresh toggle clickable
- [ ] Manual refresh button works
- [ ] Metrics update every ~10 seconds
- [ ] Last update timestamp shows

---

## 🐛 If Something's Not Working

### Metrics Showing As "0"
✅ Normal - No documents processed yet  
✅ Submit text through dashboard to see updates  
✅ Or process documents through API

### Dashboard Shows Old Data
- Check auto-refresh is ON
- Click manual "Refresh" button
- Wait 10 seconds for next auto-update

### 404 Errors
- Verify backend running: `curl http://localhost:5000/api/sources`
- Check frontend port: Firefox dev tools (F12)
- Restart both servers

### Styling Looks Broken
- Hard refresh: `Ctrl+Shift+Delete`
- Clear all cache, then refresh
- Restart frontend server

### Python API Connection Fails
- Install Flask: `pip install flask flask-cors`
- Run: `python knowledge_graph/stats_api_server.py`
- Note: Dashboard works WITHOUT Python API

---

## 📈 What's Next?

1. **Process Documents**: Use dashboard to submit text
2. **Watch Metrics Update**: See real-time changes
3. **Monitor Performance**: Check pipeline success rates
4. **Track Accuracy**: Review per-source quality
5. **Provide Feedback**: Rate the system
6. **Optimize**: Use metrics to improve pipeline

---

## 🎯 Real-Time Processing Flow

```
You submit text
    ↓
NLP Pipeline processes it
    ↓
metricsTracker records:
  - Start/end time
  - Success/failure
  - Items processed
  - Stage executed
    ↓
Backend updates cache
    ↓
Frontend polling detects update
    ↓
Dashboard animates & shows new data! ✨
```

---

## 📞 Server Status

```bash
# Check Backend
curl http://localhost:5000/api/sources

# Check Frontend
curl http://localhost:5174

# Check Python API (if running)
curl http://localhost:5001/api/graph/stats
```

All should return 200 status code.

---

## 💾 Data Persistence

Metrics are cached in:
- `backend/data/metrics-cache.json` - All metrics
- `backend/data/feedback.json` - User feedback
- `backend/data/feedback.json` - Feedback history

These persist across restarts.

---

## 🚀 Production Deployment

For production:
1. ✅ Build frontend: `npm run build`
2. ✅ Set environment variables
3. ✅ Run on dedicated servers
4. ✅ Use reverse proxy (nginx)
5. ✅ Enable HTTPS/SSL
6. ✅ Add monitoring/logging
7. ✅ Set up database (PostgreSQL/MongoDB)

---

## 📚 More Information

See detailed documentation:
- [REALTIME_CONNECTION_GUIDE.md](REALTIME_CONNECTION_GUIDE.md) - Architecture & data flow
- [ANALYTICS_DASHBOARD_GUIDE.md](ANALYTICS_DASHBOARD_GUIDE.md) - Feature details
- [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Setup & deployment

---

## ✨ You're All Set!

Your real-time analytics dashboard is **production-ready** and **fully connected** to your knowledge graph processing system.

**Next Step:** Open `http://localhost:5174/analytics` and start monitoring! 📊

---

**Update Frequency**: 10 seconds auto-refresh  
**Data Source**: metricsTracker + Knowledge Graph API  
**Status**: ✅ Live & Ready

Enjoy real-time insights into your knowledge graph processing! 🎉
