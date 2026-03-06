# Analytics Dashboard Quick Start Guide

## Prerequisites

- Node.js 16+
- Python 3.8+
- Backend server running on port 5000
- Frontend development server running

## Installation & Setup

### 1. Backend Setup

Ensure your backend is running with the new analytics API endpoints:

```bash
cd backend
npm install
npm run dev
```

This will start the Express server on `http://localhost:5000`

### 2. Frontend Setup

Navigate to the React frontend and install/run:

```bash
cd frontend/react
npm install
npm run dev
```

This will start the Vite dev server on `http://localhost:5173`

### 3. Access Dashboard

Once both servers are running:

1. Navigate to `http://localhost:5173/analytics`
2. Or click "📈 Analytics" in the navigation menu

## Features You'll See

### Dashboard Sections:

#### 1. **Key Metrics (Top Row)**
   - Total Estimate
   - Total Relations
   - Extraction Accuracy
   - Average Processing Time

#### 2. **Pipeline Performance (Left Panel)**
   - Stage-by-stage success rates
   - Processing time per stage
   - Item counts
   - Color-coded indicators

#### 3. **Data Sources Accuracy (Right Panel)**
   - Wikipedia accuracy
   - arXiv accuracy
   - News API accuracy
   - Custom uploads accuracy

#### 4. **Feedback & Status Section (Bottom)**
   - Star rating system
   - Feedback textarea
   - Pipeline status overview
   - Real-time refresh button

## Using the Dashboard

### View Metrics
- Metrics automatically update every 30 seconds
- Hover over cards for additional information
- Click "🔄 Refresh Data" for immediate update

### Submit Feedback
1. Select a star rating (1-5)
2. Type your feedback or suggestion
3. Click "Submit Feedback"
4. See confirmation message

### Monitor Performance
- Watch pipeline stages for bottlenecks
- Check accuracy per data source
- Monitor queue length and throughput

## Customization

### Change Colors
Edit [analytics-dashboard.css](frontend/react/src/pages/css/analytics-dashboard.css):
```css
.metric-card {
    background: white;
    /* Change colors here */
}
```

### Modify Refresh Interval
Edit [analytics-dashboard.jsx](frontend/react/src/pages/analytics-dashboard.jsx):
```javascript
const interval = setInterval(fetchAnalytics, 30000); // milliseconds
```

### Update Metric Thresholds
Edit API endpoints in [api.js](backend/src/routes/api.js) to adjust success rate ranges

## Environment Variables

Create `.env` file in frontend/react:
```
VITE_API_BASE_URL=http://localhost:5000
```

## Common Issues & Solutions

### Dashboard shows "Failed to fetch analytics data"
- ✓ Verify backend is running on port 5000
- ✓ Check CORS headers are configured
- ✓ Ensure API endpoints exist

### Metrics not updating
- ✓ Check browser console for errors
- ✓ Click manual refresh button
- ✓ Verify network tab for API calls

### Styling looks broken
- ✓ Clear browser cache (Ctrl+Shift+Del)
- ✓ Rebuild frontend (npm run build)
- ✓ Restart dev server

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/metrics` | GET | Overall metrics |
| `/api/analytics/performance` | GET | Pipeline performance |
| `/api/analytics/accuracy` | GET | Data source accuracy |
| `/api/analytics/feedback` | POST | Submit feedback |

## Next Steps

1. **Monitor Pipeline**: Watch the dashboard during processing
2. **Collect Feedback**: Get team feedback on performance
3. **Analyze Data**: Use metrics to identify optimization opportunities
4. **Improve Pipeline**: Make adjustments based on metrics and feedback

## File Structure

```
frontend/react/
├── src/
│   ├── pages/
│   │   ├── analytics-dashboard.jsx (Main component)
│   │   └── css/
│   │       └── analytics-dashboard.css (Styles)
│   ├── components/
│   │   ├── Navigation.jsx (Navigation bar)
│   │   └── css/
│   │       └── navigation.css
│   └── App.jsx (Updated with /analytics route)
│
backend/
└── src/
    └── routes/
        └── api.js (New analytics endpoints)
```

## Support & Documentation

- See [ANALYTICS_DASHBOARD_GUIDE.md](../ANALYTICS_DASHBOARD_GUIDE.md) for detailed documentation
- Check backend console logs for API errors
- Review browser DevTools for client-side issues

## Performance Tips

1. **Reduce Refresh Interval Carefully**: Intervals < 10s may cause server load
2. **Cache Results**: Consider caching analytics data server-side
3. **Batch Updates**: Combine multiple metrics into single requests
4. **Monitor Feedback**: Periodically review user feedback for insights

---

Happy monitoring! 📊
