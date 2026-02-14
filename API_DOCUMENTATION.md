# KnowMap API Documentation

This document provides comprehensive information about the Wikipedia, arXiv, and News API integrations implemented in the KnowMap project.

## Overview

The KnowMap backend now supports three major data sources:
- **Wikipedia API** - For general knowledge and encyclopedia content
- **arXiv API** - For academic papers and research articles
- **News API** - For current news and articles

## API Endpoints

### 1. Get Available Data Sources

**GET** `/api/sources`

Returns a list of all available data sources.

**Response:**
```json
{
  "success": true,
  "data": {
    "sources": ["wikipedia", "arxiv", "news"],
    "message": "Available data sources"
  }
}
```

### 2. Unified Search (User Selects Source)

**POST** `/api/search`

Search across a specific data source selected by the user.

**Request Body:**
```json
{
  "source": "wikipedia|arxiv|news",
  "query": "search query",
  "options": {
    "pageSize": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "source": "wikipedia",
  "query": "Artificial Intelligence",
  "data": {
    // Source-specific data structure
  }
}
```

### 3. Multi-Source Search

**POST** `/api/search/multi`

Search multiple sources simultaneously.

**Request Body:**
```json
{
  "sources": ["wikipedia", "news"],
  "query": "Climate Change",
  "options": {
    "pageSize": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "Climate Change",
  "sources": ["wikipedia", "news"],
  "data": {
    "wikipedia": { /* wikipedia results */ },
    "news": { /* news results */ }
  }
}
```

### 4. Direct Wikipedia Search

**GET** `/api/search/wikipedia?q=query&pageSize=5`

Direct search endpoint for Wikipedia.

**Response:**
```json
{
  "success": true,
  "source": "Wikipedia",
  "query": "Artificial Intelligence",
  "data": {
    "title": "Artificial intelligence",
    "extract": "Artificial intelligence (AI) is intelligence demonstrated by machines...",
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "imageUrl": "https://upload.wikimedia.org/...",
    "thumbnailUrl": "https://upload.wikimedia.org/...",
    "pageId": 12345,
    "relatedResults": [
      {
        "title": "Machine learning",
        "snippet": "Machine learning (ML) is a field of study in artificial intelligence...",
        "pageid": 67890
      }
    ]
  }
}
```

### 5. Direct arXiv Search

**GET** `/api/search/arxiv?q=query&pageSize=5`

Direct search endpoint for arXiv academic papers.

**Response:**
```json
{
  "success": true,
  "source": "arXiv",
  "query": "Quantum Computing",
  "data": {
    "totalResults": 5,
    "papers": [
      {
        "title": "Quantum Computing: Progress and Prospects",
        "authors": ["John Doe", "Jane Smith"],
        "summary": "This paper explores the current state and future prospects...",
        "published": "2023-01-15T10:30:00Z",
        "updated": "2023-01-16T14:20:00Z",
        "pdfLink": "https://arxiv.org/pdf/2301.12345.pdf",
        "url": "https://arxiv.org/abs/2301.12345"
      }
    ]
  }
}
```

### 6. Direct News Search

**GET** `/api/search/news?q=query&pageSize=5`

Direct search endpoint for news articles.

**Response:**
```json
{
  "success": true,
  "source": "NewsAPI",
  "query": "Technology",
  "data": {
    "totalResults": 100,
    "articles": [
      {
        "title": "Latest Tech Innovations",
        "description": "Breaking news about the latest technology developments...",
        "content": "Full article content...",
        "url": "https://example.com/article",
        "imageUrl": "https://example.com/image.jpg",
        "publishedAt": "2023-01-15T12:00:00Z",
        "source": {
          "name": "Tech News",
          "id": "tech-news"
        }
      }
    ]
  }
}
```

### 7. News Headlines

**GET** `/api/news/headlines?category=technology&pageSize=5`

Get top headlines by category.

**Response:**
```json
{
  "success": true,
  "source": "NewsAPI",
  "query": "Top headlines - technology",
  "data": {
    "totalResults": 50,
    "articles": [
      // Same structure as direct news search
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## API Key Setup

### NewsAPI Key

To use the News API, you need to obtain a free API key from [NewsAPI.org](https://newsapi.org/):

1. Visit [https://newsapi.org/register](https://newsapi.org/register)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file:

```env
NEWS_API_KEY=your_api_key_here
```

### Wikipedia and arXiv

No API keys required for Wikipedia and arXiv APIs.

## Usage Examples

### Frontend Integration

```javascript
// Fetch available sources
const sources = await fetch('/api/sources').then(r => r.json());

// Search Wikipedia
const wikipediaResults = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source: 'wikipedia',
    query: 'Machine Learning'
  })
}).then(r => r.json());

// Search multiple sources
const multiResults = await fetch('/api/search/multi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sources: ['wikipedia', 'news'],
    query: 'Climate Change'
  })
}).then(r => r.json());
```

### Backend Service Usage

```javascript
import apiService from './services/apiService.js';

// Search a single source
const result = await apiService.search('wikipedia', 'Artificial Intelligence');

// Search multiple sources
const multiResult = await apiService.searchMultiple(
  ['wikipedia', 'arxiv'], 
  'Quantum Computing'
);

// Get news headlines
const headlines = await apiService.search('news', '', {
  getHeadlines: true,
  category: 'technology'
});
```

## Rate Limits and Best Practices

### Wikipedia API
- Rate limit: ~300 requests per hour per IP
- Use caching for repeated queries
- Respect Wikipedia's terms of service

### arXiv API
- Rate limit: ~3000 requests per 10 minutes per IP
- Include user agent in requests
- Use specific search queries for better results

### NewsAPI
- Free tier: 500 requests per day
- Paid plans available for higher limits
- Cache results to avoid hitting limits

## Troubleshooting

### Common Issues

1. **NewsAPI Key Not Configured**
   ```
   Error: NewsAPI key not configured. Please set NEWS_API_KEY in .env file
   ```
   Solution: Add your NewsAPI key to the `.env` file.

2. **Network Timeout**
   ```
   Error: Request timeout
   ```
   Solution: Check your internet connection and try again.

3. **No Results Found**
   ```
   {
     "success": false,
     "message": "No results found",
     "data": []
   }
   ```
   Solution: Try different search terms or check if the API is accessible.

### Debug Mode

Enable debug logging by setting the environment variable:
```env
DEBUG=true
```

## Security Considerations

- API keys are stored in environment variables
- CORS is enabled for frontend-backend communication
- Input validation prevents injection attacks
- Rate limiting protects against abuse

## Future Enhancements

- Add caching layer for improved performance
- Implement search result ranking
- Add support for additional data sources
- Implement user authentication for API access
- Add search history and favorites