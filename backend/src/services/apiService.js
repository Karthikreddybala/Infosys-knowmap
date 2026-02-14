import wikipediaService from './wikipediaService.js';
import arxivService from './arxivService.js';
import newsService from './newsService.js';

/**
 * Main API Service Orchestrator
 * Routes requests to appropriate data source services
 */
class ApiService {
    constructor() {
        this.services = {
            wikipedia: wikipediaService,
            arxiv: arxivService,
            news: newsService
        };
        
        this.supportedSources = Object.keys(this.services);
    }

    /**
     * Get list of supported data sources
     * @returns {Array} List of supported sources
     */
    getSupportedSources() {
        return this.supportedSources;
    }

    /**
     * Search across a specific data source
     * @param {string} source - Data source (wikipedia, arxiv, news)
     * @param {string} query - Search query
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Search results
     */
    async search(source, query, options = {}) {
        try {
            // Validate source
            if (!source || !this.supportedSources.includes(source.toLowerCase())) {
                return {
                    success: false,
                    message: `Invalid source. Supported sources: ${this.supportedSources.join(', ')}`,
                    data: null
                };
            }

            // Validate query
            if (!query || query.trim().length === 0) {
                return {
                    success: false,
                    message: 'Search query cannot be empty',
                    data: null
                };
            }

            const sourceKey = source.toLowerCase();
            const service = this.services[sourceKey];

            // Call the appropriate service
            let result;
            if (sourceKey === 'news' && options.getHeadlines) {
                result = await service.getTopHeadlines(options.category, options.pageSize);
            } else {
                result = await service.search(query, options.pageSize);
            }

            return result;

        } catch (error) {
            console.error('API Service Error:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to process search request',
                data: null
            };
        }
    }

    /**
     * Search multiple sources simultaneously
     * @param {Array} sources - Array of data sources
     * @param {string} query - Search query
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Combined results
     */
    async searchMultiple(sources, query, options = {}) {
        try {
            if (!Array.isArray(sources) || sources.length === 0) {
                return {
                    success: false,
                    message: 'At least one source must be specified',
                    data: null
                };
            }

            if (!query || query.trim().length === 0) {
                return {
                    success: false,
                    message: 'Search query cannot be empty',
                    data: null
                };
            }

            // Validate all sources
            const invalidSources = sources.filter(source => !this.supportedSources.includes(source.toLowerCase()));
            if (invalidSources.length > 0) {
                return {
                    success: false,
                    message: `Invalid sources: ${invalidSources.join(', ')}. Supported sources: ${this.supportedSources.join(', ')}`,
                    data: null
                };
            }

            // Execute searches in parallel
            const searchPromises = sources.map(source => this.search(source, query, options));
            const results = await Promise.all(searchPromises);

            // Combine results
            const combinedResults = {
                success: results.every(r => r.success),
                query: query,
                sources: sources,
                data: {}
            };

            results.forEach((result, index) => {
                const source = sources[index];
                combinedResults.data[source] = result;
            });

            return combinedResults;

        } catch (error) {
            console.error('Multi-source API Service Error:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to process multi-source search request',
                data: null
            };
        }
    }
}

export default new ApiService();