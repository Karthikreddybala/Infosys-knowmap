# Knowledge Graph Analytics Dashboard

## Overview

The Analytics Dashboard provides a comprehensive view of your Knowledge Graph processing system's performance, accuracy, and health status. It includes real-time metrics, pipeline performance monitoring, and feedback collection for continuous improvement.

## Features

### 1. **Key Metrics Cards**
   - **Total Estimate**: Total number of documents processed
   - **Total Relations**: Count of semantic relationships identified
   - **Extraction Accuracy**: Overall accuracy of data extraction across all sources
   - **Average Processing Time**: Mean time to process documents

### 2. **Processing Pipeline Performance**
   - Visual representation of each pipeline stage
   - Success rates for each processing step
   - Average processing time per stage
   - Item count processed by each stage

   **Pipeline Stages:**
   - Text Extraction
   - Tokenization
   - NLP Analysis
   - Entity Recognition
   - Relation Extraction
   - Graph Construction

### 3. **Data Sources Accuracy**
   - Per-source extraction accuracy metrics
   - Visual progress bars showing accuracy levels
   - Item count processed per source
   - Supported sources:
     - Wikipedia
     - arXiv
     - News API
     - Custom Uploads

### 4. **Pipeline Status Overview**
   - Current processing status
   - Current throughput (documents/min)
   - Queue length
   - System success rate
   - Last update timestamp
   - Manual refresh button

### 5. **NLP Pipeline Feedback Section**
   - 5-star rating system
   - Detailed feedback textarea
   - Feedback submission with validation
   - Success confirmation message

## Accessing the Dashboard

1. **From Navigation Menu:**
   - Click "📈 Analytics" in the top navigation bar

2. **Direct URL:**
   ```
   http://localhost:5173/analytics
   ```

## API Endpoints

### Get Overall Metrics
```
GET /api/analytics/metrics
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalEstimate": 8500,
    "totalRelations": 42000,
    "queueLength": 15,
    "lastUpdate": "2026-03-04T12:30:45Z",
    "documentsProcessedToday": 750
  }
}
```

### Get Pipeline Performance
```
GET /api/analytics/performance
```
**Response:**
```json
{
  "success": true,
  "data": {
    "avgProcessingTime": "1.25",
    "currentThroughput": 35,
    "successRate": 92,
    "pipelineStages": [
      {
        "name": "Text Extraction",
        "success_rate": 95,
        "avg_time": 145,
        "processed": 3500
      }
      // ... more stages
    ]
  }
}
```

### Get Data Source Accuracy
```
GET /api/analytics/accuracy
```
**Response:**
```json
{
  "success": true,
  "data": {
    "overallAccuracy": "89.5",
    "sourceAccuracy": [
      {
        "source": "Wikipedia",
        "accuracy": 92,
        "items_processed": 8500
      }
      // ... more sources
    ]
  }
}
```

### Submit Feedback
```
POST /api/analytics/feedback
Content-Type: application/json

{
  "feedback": "System performance has improved significantly",
  "rating": 5
}
```
**Response:**
```json
{
  "success": true,
  "message": "Feedback received successfully",
  "data": {
    "id": 1709555445000
  }
}
```

## Visual Features

### Color Coding
- **Green** (#28a745): Excellent performance (95%+)
- **Yellow** (#ffc107): Good performance (80-95%)
- **Red** (#dc3545): Needs attention (<80%)

### Animations
- Smooth gradient backgrounds
- Card hover effects with elevation
- Pulse animation for active status indicator
- Smooth progress bar animations
- Slide-in animations for cards

## Real-Time Updates

The dashboard automatically refreshes metrics every 30 seconds. You can also manually refresh by:
- Clicking the "🔄 Refresh Data" button in the status card
- Navigating away and back to the dashboard

## Performance Indicators

### Processing Time
- **Optimal**: < 1 second per document
- **Good**: 1-2 seconds per document
- **Investigation needed**: > 2 seconds per document

### Success Rate
- **Excellent**: ≥ 95%
- **Good**: 80-95%
- **Needs attention**: < 80%

### Data Source Accuracy
- **Excellent**: ≥ 90%
- **Good**: 75-90%
- **Needs review**: < 75%

## Troubleshooting

### Metrics Not Loading
1. Check backend server is running on port 5000
2. Verify API endpoints are accessible
3. Check browser console for CORS errors
4. Try manual refresh

### Inaccurate Data
1. Ensure NLP pipeline is processing correctly
2. Check data source connections
3. Review feedback submissions for user reports

## Integration with Other Features

- **Dashboard**: Traditional search and query interface
- **Knowledge Graph**: Visual graph visualization and exploration
- **Analytics**: System performance and health monitoring

## Future Enhancements

- [ ] Historical data trending (line charts over time)
- [ ] Alert system for performance drops
- [ ] Custom date range filtering
- [ ] Export metrics as PDF/CSV
- [ ] Performance prediction models
- [ ] Advanced anomaly detection
- [ ] User feedback analytics dashboard
- [ ] Pipeline stage drill-down details

## Configuration

### Auto-Refresh Interval
To change the auto-refresh interval (default: 30 seconds), modify in [analytics-dashboard.jsx](frontend/react/src/pages/analytics-dashboard.jsx):

```javascript
const interval = setInterval(fetchAnalytics, 30000); // Change 30000 to desired milliseconds
```

### API Base URL
Configure in environment file or modify:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

## Component Structure

```
AnalyticsDashboard
├── Metrics Cards (4 columns)
├── Performance & Accuracy Section
│   ├── Processing Pipeline Performance
│   └── Data Sources Accuracy
└── Feedback & Status Section
    ├── NLP Pipeline Feedback Form
    └── Pipeline Status Overview
```

## Styling Framework

- React Bootstrap for layout
- Custom CSS for animations and styling
- Responsive design for mobile/tablet/desktop
- Color-coded visual indicators

## Support

For issues or feature requests, please contact the development team or open an issue in the project repository.
