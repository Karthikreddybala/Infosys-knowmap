import axios from 'axios';

/**
 * arXiv API Service
 * Uses arXiv's public API (no API key required)
 */
class ArxivService {
    constructor() {
        this.baseURL = 'http://export.arxiv.org/api/query';
        this.timeout = 10000;
    }

    /**
     * Search arXiv for a given query
     * @param {string} query - Search query
     * @param {number} maxResults - Maximum number of results (default: 5)
     * @returns {Promise<Object>} Search results
     */
    async search(query, maxResults = 5) {
        try {
            if (!query || query.trim().length === 0) {
                throw new Error('Search query cannot be empty');
            }

            // arXiv API parameters
            const params = {
                search_query: `all:${encodeURIComponent(query)}`,
                start: 0,
                max_results: maxResults,
                sortBy: 'relevance',
                sortOrder: 'descending'
            };

            const queryString = new URLSearchParams(params).toString();
            const response = await axios.get(`${this.baseURL}?${queryString}`);

            if (!response.data) {
                throw new Error('No response from arXiv API');
            }

            // Parse the XML response
            const xml = response.data;
            const results = this.parseArxivXML(xml);

            return {
                success: true,
                source: 'arXiv',
                query: query,
                data: {
                    totalResults: results.length,
                    papers: results
                }
            };

        } catch (error) {
            console.error('arXiv API Error:', error.message);
            return {
                success: false,
                source: 'arXiv',
                message: error.message || 'Failed to fetch arXiv data',
                data: null
            };
        }
    }

    /**
     * Parse arXiv XML response
     * @param {string} xml - XML response from arXiv API
     * @returns {Array} Parsed papers array
     */
    parseArxivXML(xml) {
        const papers = [];
        
        // Simple XML parsing using regex (for simplicity, in production consider using a proper XML parser)
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(xml)) !== null) {
            const entry = match[1];
            
            const title = this.extractXMLValue(entry, 'title');
            const summary = this.extractXMLValue(entry, 'summary');
            const published = this.extractXMLValue(entry, 'published');
            const updated = this.extractXMLValue(entry, 'updated');
            
            // Extract authors
            const authorRegex = /<author>([\s\S]*?)<\/author>/g;
            const authors = [];
            let authorMatch;
            
            while ((authorMatch = authorRegex.exec(entry)) !== null) {
                const authorEntry = authorMatch[1];
                const authorName = this.extractXMLValue(authorEntry, 'name');
                if (authorName) {
                    authors.push(authorName);
                }
            }

            // Extract links
            const linkRegex = /<link.*?href="(.*?)".*?\/>/g;
            const links = [];
            let linkMatch;
            
            while ((linkMatch = linkRegex.exec(entry)) !== null) {
                links.push(linkMatch[1]);
            }

            // Find PDF link
            const pdfLink = links.find(link => link.includes('.pdf')) || links[0] || '';

            if (title && summary) {
                papers.push({
                    title: title.replace(/\s+/g, ' ').trim(),
                    authors: authors,
                    summary: summary.replace(/\s+/g, ' ').trim(),
                    published: published,
                    updated: updated,
                    pdfLink: pdfLink,
                    url: links.find(link => !link.includes('.pdf')) || pdfLink
                });
            }
        }

        return papers;
    }

    /**
     * Extract value from XML tag
     * @param {string} xml - XML string
     * @param {string} tag - Tag name
     * @returns {string} Extracted value
     */
    extractXMLValue(xml, tag) {
        const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
        const match = xml.match(regex);
        return match ? match[1].replace(/\s+/g, ' ').trim() : '';
    }
}

export default new ArxivService();