import axios from 'axios';

/**
 * News API Service
 * Uses NewsAPI.org (requires API key)
 */
class NewsService {
    constructor() {
        this.baseURL = 'https://newsapi.org/v2';
        this.apiKey = process.env.NEWS_API_KEY;
        this.timeout = 10000;
    }

    /**
     * Search news for a given query
     * @param {string} query - Search query
     * @param {number} pageSize - Number of results (default: 5)
     * @returns {Promise<Object>} Search results
     */
    async search(query, pageSize = 5) {
        try {
            if (!this.apiKey) {
                throw new Error('NewsAPI key not configured. Please set NEWS_API_KEY in .env file');
            }

            if (!query || query.trim().length === 0) {
                throw new Error('Search query cannot be empty');
            }

            const params = {
                q: query,
                apiKey: this.apiKey,
                pageSize: pageSize,
                language: 'en',
                sortBy: 'relevancy',
                country: 'us' // Can be made configurable
            };

            const response = await axios.get(`${this.baseURL}/everything`, { params });

            if (response.data.status !== 'ok') {
                throw new Error(response.data.message || 'Failed to fetch news data');
            }

            const articles = response.data.articles.map(article => ({
                title: article.title || 'No title available',
                description: article.description || 'No description available',
                content: article.content || 'No content available',
                url: article.url || '#',
                imageUrl: article.urlToImage || null,
                publishedAt: article.publishedAt || null,
                source: {
                    name: article.source?.name || 'Unknown source',
                    id: article.source?.id || null
                }
            }));

            return {
                success: true,
                source: 'NewsAPI',
                query: query,
                data: {
                    totalResults: response.data.totalResults || articles.length,
                    articles: articles
                }
            };

        } catch (error) {
            console.error('News API Error:', error.message);
            return {
                success: false,
                source: 'NewsAPI',
                message: error.message || 'Failed to fetch news data',
                data: null
            };
        }
    }

    /**
     * Get top headlines (alternative endpoint)
     * @param {string} category - News category (business, technology, etc.)
     * @param {number} pageSize - Number of results (default: 5)
     * @returns {Promise<Object>} Top headlines
     */
    async getTopHeadlines(category = 'general', pageSize = 5) {
        try {
            if (!this.apiKey) {
                throw new Error('NewsAPI key not configured. Please set NEWS_API_KEY in .env file');
            }

            const params = {
                category: category,
                apiKey: this.apiKey,
                pageSize: pageSize,
                country: 'us',
                language: 'en'
            };

            const response = await axios.get(`${this.baseURL}/top-headlines`, { params });

            if (response.data.status !== 'ok') {
                throw new Error(response.data.message || 'Failed to fetch headlines');
            }

            const articles = response.data.articles.map(article => ({
                title: article.title || 'No title available',
                description: article.description || 'No description available',
                content: article.content || 'No content available',
                url: article.url || '#',
                imageUrl: article.urlToImage || null,
                publishedAt: article.publishedAt || null,
                source: {
                    name: article.source?.name || 'Unknown source',
                    id: article.source?.id || null
                }
            }));

            return {
                success: true,
                source: 'NewsAPI',
                query: `Top headlines - ${category}`,
                data: {
                    totalResults: response.data.totalResults || articles.length,
                    articles: articles
                }
            };

        } catch (error) {
            console.error('News API Headlines Error:', error.message);
            return {
                success: false,
                source: 'NewsAPI',
                message: error.message || 'Failed to fetch headlines',
                data: null
            };
        }
    }
}

export default new NewsService();