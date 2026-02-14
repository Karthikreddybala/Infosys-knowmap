import axios from 'axios';

/**
 * Wikipedia API Service
 * Uses Wikipedia's REST API (no API key required)
 */
class WikipediaService {
    constructor() {
        this.baseURL = 'https://en.wikipedia.org/api/rest_v1';
        this.timeout = 10000;
        this.userAgent = 'KnowMap-App/1.0 (https://github.com/your-organization/knowmap; contact@knowmap.com)';
    }

    /**
     * Search Wikipedia for a given query
     * @param {string} query - Search query
     * @returns {Promise<Object>} Search results
     */
    async search(query) {
        try {
            if (!query || query.trim().length === 0) {
                throw new Error('Search query cannot be empty');
            }

            // First, get search results to find the best matching page
            const searchResponse = await axios.get(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            );

            if (!searchResponse.data.query.search || searchResponse.data.query.search.length === 0) {
                return {
                    success: false,
                    message: 'No results found',
                    data: []
                };
            }

            // Get the first result's page ID
            const pageId = searchResponse.data.query.search[0].pageid;
            
            // Get detailed page information
            const pageResponse = await axios.get(
                `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts|pageimages|info&explaintext=true&exintro=true&exlimit=1&piprop=original|thumbnail&pithumbsize=300&inprop=url&format=json&origin=*`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            );

            const page = pageResponse.data.query.pages[pageId];
            
            // Get more search results for suggestions
            const searchResults = searchResponse.data.query.search.slice(0, 5).map(result => ({
                title: result.title,
                snippet: result.snippet.replace(/<[^>]*>/g, '').trim(),
                pageid: result.pageid
            }));

            return {
                success: true,
                source: 'Wikipedia',
                query: query,
                data: {
                    title: page.title,
                    extract: page.extract || 'No extract available',
                    url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                    imageUrl: page.original ? page.original.source : (page.thumbnail ? page.thumbnail.source : null),
                    thumbnailUrl: page.thumbnail ? page.thumbnail.source : null,
                    pageId: page.pageid,
                    relatedResults: searchResults
                }
            };

        } catch (error) {
            console.error('Wikipedia API Error:', error.message);
            
            // Handle specific error cases
            if (error.response && error.response.status === 403) {
                return {
                    success: false,
                    source: 'Wikipedia',
                    message: 'Access forbidden. Please check User-Agent header and API usage limits.',
                    data: null
                };
            }
            
            return {
                success: false,
                source: 'Wikipedia',
                message: error.message || 'Failed to fetch Wikipedia data',
                data: null
            };
        }
    }
}

export default new WikipediaService();