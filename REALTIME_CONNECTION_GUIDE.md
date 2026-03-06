# Real-Time Knowledge Graph Analytics Connection

## Overview

The analytics dashboard is now **directly connected** to your knowledge graph processing system. Every metric updates in real-time as graphs are generated and data is processed.

---

## 🔌 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend                               │
│              📊 Analytics Dashboard (Port 5174)                 │
│  - Auto-refresh every 10 seconds                                │
│  - Fetches from combined /api/analytics/dashboard endpoint      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP Polling
                          │ (Real-time data)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Node.js Backend (Port 5000)                    │
│  - /api/analytics/dashboard ← Combined endpoint                 │
│  - /api/analytics/metrics                                       │
│  - /api/analytics/performance                                   │
│  - /api/analytics/accuracy                                      │
│  - /api/graph/stats                                             │
│                                                                   │
│  Uses metricsTracker to gather real data from:                  │
│  - Knowledge graph processing                                   │
│  - NLP pipeline execution                                       │
│  - Document processing stats                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Optional: Fetch from Python
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│            Python Knowledge Graph Server (Port 5001)            │
│                  🧠 stats_api_server.py                        │
│  - /api/graph/stats ← Graph statistics                          │
│  - /api/graph/nodes ← All entities                              │
│  - /api/graph/edges ← All relationships                         │
│  - /api/graph/relations ← Relation types                        │
│  - /api/graph/process ← Process text & update graph             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Real-Time Data Flow

### 1. **Document Processing**
```
User submits text → Dashboard sends to NLP API
                 ↓
Text extracted & tokenized → Metrics tracked
                 ↓
Entities recognized → Knowledge graph updated
                 ↓
Relations extracted → nodes/edges increased
                 ↓
Graph constructed → Final stats calculated
                 ↓
Dashboard refreshes → Shows updated metrics!
```

### 2. **Metrics Updated Automatically**
- **Total Documents**: Increments as each document is processed
- **Total Relations**: Updates as new edges added to graph
- **Total Nodes**: Updates as new entities discovered
- **Extraction Accuracy**: Calculated per data source
- **Pipeline Performance**: Tracked at each stage
- **Processing Time**: Measured in real-time

---

## 🚀 Getting Started

### Step 1: Install Python Dependencies
```bash
cd knowledge_graph
pip install flask flask-cors networkx spacy nltk
python -m spacy download en_core_web_sm
```

### Step 2: Start All Services

**Terminal 1 - Knowledge Graph Stats API**
```bash
cd knowledge_graph
python stats_api_server.py
```
Output: `Knowledge Graph Statistics API Server on port 5001`

**Terminal 2 - Node.js Backend**
```bash
cd backend
npm run dev
```
Output: `Server running on http://localhost:5000`

**Terminal 3 - React Frontend**
```bash
cd frontend/react
npm run dev
```
Output: `http://localhost:5174/`

### Step 3: Open Dashboard
```
http://localhost:5174/analytics
```

---

## 🎯 Real-Time Features

### Auto-Refresh
- **Default**: Every 10 seconds
- **Toggle**: Click "Auto Refresh" button to enable/disable
- **Manual**: Click "Refresh" button for immediate update
- **Display**: Shows last update timestamp

### Data Updates

**From Knowledge Graph Processing:**
- Metrics auto-update as documents are processed
- Pipeline stages show real success rates
- Extraction accuracy updates per source
- Queue length reflects pending items

**From NLP Pipeline:**
- Text Extraction → updates extracted items
- Tokenization → updates tokenized count
- NLP Analysis → updates analyzed items
- Entity Recognition → increases total nodes
- Relation Extraction → increases total relations
- Graph Construction → finalizes graph stats

---

## 📡 API Endpoints

### Combined Endpoint (Recommended)
```
GET /api/analytics/dashboard
```
Returns all analytics data in one request - **fastest!**

```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalEstimate": 150,
      "totalRelations": 450,
      "totalNodes": 320,
      "queueLength": 5,
      "graphStatus": "active",
      "lastUpdate": "2026-03-04T15:30:45Z"
    },
    "performance": {
      "avgProcessingTime": "1.25",
      "currentThroughput": 35,
      "successRate": 92,
      "pipelineStages": [...]
    },
    "accuracy": {
      "overallAccuracy": "89.5",
      "sourceAccuracy": [...]
    }
  }
}
```

### Individual Endpoints (Fallback)
```
GET /api/analytics/metrics       - Metrics only
GET /api/analytics/performance   - Pipeline performance
GET /api/analytics/accuracy      - Data source accuracy
GET /api/graph/stats            - Knowledge graph statistics
```

---

## 🔗 Connecting Your Own Processing Pipeline

### Option 1: Automatic Tracking (Easiest)

In your Node.js code, use the metricsTracker:

```javascript
import metricsTracker from './services/metricsTracker.js';

// Track document processing
metricsTracker.recordDocumentProcessed('wikipedia');

// Track pipeline stage
const startTime = Date.now();
// ... do processing ...
const endTime = Date.now();
metricsTracker.recordStageExecution('Entity Recognition', startTime, endTime, true, itemCount);

// Save metrics
metricsTracker.saveMetrics();
```

### Option 2: Python API (For Knowledge Graph)

Send graph stats to Node.js backend:

```python
import requests
import json

# After building knowledge graph
graph_stats = {
    "num_nodes": len(kg.get_nodes()),
    "num_edges": len(kg.get_edges()),
    "nodes": [...],
    "edges": [...]
}

# Update Node.js cache
response = requests.post('http://localhost:5000/api/graph/update-stats', 
                        json=graph_stats)
```

### Option 3: Manual Updates

Directly update the cache file at:
```
backend/data/metrics-cache.json
```

---

## 📈 Example Use Cases

### Processing Large Document Set
1. Start dashboard with auto-refresh ON
2. Submit documents for processing
3. Watch metrics update in real-time:
   - Total documents increases
   - Queue length changes
   - Success rates update
   - Extraction accuracy calculated
   - Processing time displayed

### Monitoring Pipeline Performance
1. Open dashboard
2. Observe pipeline stages
3. Identify bottlenecks (slower stages)
4. See success rates drop if issues occur
5. Get timing for optimization

### Tracking Data Quality
1. View per-source accuracy
2. Monitor overall extraction quality
3. Identify problematic sources
4. Track improvements over time

---

## ⚙️ Configuration

### Change Refresh Interval

Edit `frontend/react/src/pages/analytics-dashboard.jsx`:

```javascript
// Current: 10000ms (10 seconds)
interval = setInterval(fetchAnalytics, 10000);

// Change to 5 seconds (faster updates)
interval = setInterval(fetchAnalytics, 5000);
```

### Change Python API Port

Set environment variable:
```bash
export PYTHON_API_URL=http://localhost:5002
```

Or edit `backend/src/services/metricsTracker.js`:
```javascript
const PYTHON_API_BASE = process.env.PYTHON_API_URL || 'http://localhost:5001';
```

### Enable/Disable Python API Connection

In `metricsTracker.js`:
```javascript
// Comment out to disable Python API calls
// const response = await axios.get(...);
```

---

## 🐛 Troubleshooting

### Metrics Not Updating
1. ✅ Check all three servers are running (5000, 5001, 5174)
2. ✅ Click "Refresh" button manually
3. ✅ Check browser console for errors (F12)
4. ✅ Verify auto-refresh is enabled

### Dashboard Shows Old Data
1. ✅ Click "Auto Refresh" toggle ON
2. ✅ Wait 10 seconds for automatic update
3. ✅ Or click "Refresh" button

### Python API Errors
1. ✅ Install Flask: `pip install flask flask-cors`
2. ✅ Check port 5001 is available
3. ✅ Run: `python stats_api_server.py`
4. ✅ Dashboard works with OR without Python API

### Graph Stats Not Showing
1. ✅ Graph stats are optional - dashboard works without them
2. ✅ Submit text to processing endpoint first
3. ✅ Then stats will be available

---

## 📊 Real Data Sources

### Metrics Come From:
- **metricsTracker.js** - Tracks all processing events
- **Graph Cache File** - `backend/data/metrics-cache.json`
- **Pipeline History** - Stores execution times
- **Feedback Data** - User submissions

### Automatic Tracking Includes:
- Documents processed per source
- Processing time per stage
- Success/failure rates
- Items processed per stage
- Overall extraction accuracy

---

## 🔄 Real-Time Processing Example

```
Frontend                  Backend                Python
====================================================================
  │                         │                       │
  ├─ Auto-refresh every ────┤                       │
  │  10 seconds             ├─ Check metricsTracker│
  │                         │  for latest data      │
  │                         ├─ Optionally fetch ────┤
  │                         │  from Python API      │
  │                         │ (graph stats)         │
  │◄─ Returns combined ──────┤                       │
  │  metrics data           │                       │
  │                         │                       │
  ├──────────────────────────┤  User processes ──────┤
  │  User typing in text     │  text & submits     │
  │...                       │  to NLP pipeline    │
  │...                       │                       │
  │                         ├─ Record in ───────────┤
  │                         │  metricsTracker      │
  │                         │                       │
  │◄─ Updated metrics ───────┤                       │
  │  (real processing!)     │                       │
  │                         │  Returns stats to ────┤
  │                         │  Node.js             │
  │                         ├─ Update cache file   │
  │                         │                       │
  └─ Real-time display ─────┘───────────────────────┘
   (Every 10 seconds)
```

---

## ✅ Validation

Test the real-time connection:

```bash
# 1. Dashboard should load
curl http://localhost:5174/analytics

# 2. Get current metrics
curl http://localhost:5000/api/analytics/metrics

# 3. Get combined dashboard data
curl http://localhost:5000/api/analytics/dashboard

# 4. Python API test (optional)
curl http://localhost:5001/api/graph/stats
```

---

## 📚 Next Steps

1. **Start Processing**: Submit documents through the dashboard
2. **Monitor Metrics**: Watch real-time updates
3. **Analyze Results**: Review accuracy and performance
4. **Optimize**: Identify and fix bottlenecks
5. **Feedback**: Rate and comment on pipeline performance

---

## 🎉 You're Ready!

Your analytics dashboard is now **fully connected to your knowledge graph processing pipeline** with real-time updates!

**Current Update Frequency**: 10 seconds  
**Data Sources**: metricsTracker + Knowledge Graph API  
**Status**: ✅ Production Ready

---

For issues or questions, check the browser console (F12) for error messages, or verify all three servers are running on the correct ports.
