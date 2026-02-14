import express from 'express';
import apiService from '../services/apiService.js';

const router = express.Router();

/**
 * GET /api/sources
 * Get list of supported data sources
 */
router.get('/sources', (req, res) => {
    try {
        const sources = apiService.getSupportedSources();
        res.json({
            success: true,
            data: {
                sources: sources,
                message: 'Available data sources'
            }
        });
    } catch (error) {
        console.error('Error getting sources:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get available sources',
            error: error.message
        });
    }
});

/**
 * POST /api/search
 * Unified search endpoint - user selects which API to query
 */
router.post('/search', async (req, res) => {
    try {
        const { source, query, options = {} } = req.body;

        if (!source) {
            return res.status(400).json({
                success: false,
                message: 'Source parameter is required',
                data: null
            });
        }

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required',
                data: null
            });
        }

        const result = await apiService.search(source, query, options);
        
        res.json(result);

    } catch (error) {
        console.error('Search API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * POST /api/search/multi
 * Search multiple sources simultaneously
 */
router.post('/search/multi', async (req, res) => {
    try {
        const { sources, query, options = {} } = req.body;

        if (!sources || !Array.isArray(sources)) {
            return res.status(400).json({
                success: false,
                message: 'Sources parameter must be an array',
                data: null
            });
        }

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required',
                data: null
            });
        }

        const result = await apiService.searchMultiple(sources, query, options);
        
        res.json(result);

    } catch (error) {
        console.error('Multi-search API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/search/wikipedia?q=query
 * Direct Wikipedia search endpoint
 */
router.get('/search/wikipedia', async (req, res) => {
    try {
        const { q: query, pageSize = 5 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter (q) is required',
                data: null
            });
        }

        const result = await apiService.search('wikipedia', query, { pageSize });
        
        res.json(result);

    } catch (error) {
        console.error('Wikipedia API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/search/arxiv?q=query
 * Direct arXiv search endpoint
 */
router.get('/search/arxiv', async (req, res) => {
    try {
        const { q: query, pageSize = 5 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter (q) is required',
                data: null
            });
        }

        const result = await apiService.search('arxiv', query, { pageSize });
        
        res.json(result);

    } catch (error) {
        console.error('arXiv API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/search/news?q=query
 * Direct News search endpoint
 */
router.get('/search/news', async (req, res) => {
    try {
        const { q: query, pageSize = 5 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter (q) is required',
                data: null
            });
        }

        const result = await apiService.search('news', query, { pageSize });
        
        res.json(result);

    } catch (error) {
        console.error('News API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/news/headlines?category=technology
 * Get top headlines by category
 */
router.get('/news/headlines', async (req, res) => {
    try {
        const { category = 'general', pageSize = 5 } = req.query;

        const result = await apiService.search('news', '', {
            getHeadlines: true,
            category,
            pageSize
        });
        
        res.json(result);

    } catch (error) {
        console.error('News Headlines API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;