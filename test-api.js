/**
 * Test script for KnowMap API integrations
 * Run this script to test the Wikipedia, arXiv, and News API endpoints
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing KnowMap API Integrations\n');

    try {
        // Test 1: Get available sources
        console.log('1. Testing GET /sources...');
        const sourcesResponse = await axios.get(`${BASE_URL}/sources`);
        console.log('✅ Sources:', sourcesResponse.data.data.sources);
        
        // Test 2: Test Wikipedia search
        console.log('\n2. Testing Wikipedia search...');
        const wikipediaResponse = await axios.get(`${BASE_URL}/search/wikipedia?q=Artificial+Intelligence&pageSize=3`);
        if (wikipediaResponse.data.success) {
            console.log('✅ Wikipedia result:', {
                title: wikipediaResponse.data.data.title,
                hasImage: !!wikipediaResponse.data.data.imageUrl,
                hasExtract: wikipediaResponse.data.data.extract.length > 0
            });
        } else {
            console.log('❌ Wikipedia error:', wikipediaResponse.data.message);
        }

        // Test 3: Test arXiv search
        console.log('\n3. Testing arXiv search...');
        const arxivResponse = await axios.get(`${BASE_URL}/search/arxiv?q=quantum+computing&pageSize=3`);
        if (arxivResponse.data.success) {
            console.log('✅ arXiv result:', {
                totalResults: arxivResponse.data.data.totalResults,
                firstPaper: arxivResponse.data.data.papers[0]?.title
            });
        } else {
            console.log('❌ arXiv error:', arxivResponse.data.message);
        }

        // Test 4: Test News search (requires API key)
        console.log('\n4. Testing News search...');
        const newsResponse = await axios.get(`${BASE_URL}/search/news?q=technology&pageSize=3`);
        if (newsResponse.data.success) {
            console.log('✅ News result:', {
                totalResults: newsResponse.data.data.totalResults,
                firstArticle: newsResponse.data.data.articles[0]?.title
            });
        } else {
            console.log('⚠️  News error (likely no API key):', newsResponse.data.message);
        }

        // Test 5: Test unified search
        console.log('\n5. Testing unified search...');
        const unifiedResponse = await axios.post(`${BASE_URL}/search`, {
            source: 'wikipedia',
            query: 'Machine Learning'
        });
        if (unifiedResponse.data.success) {
            console.log('✅ Unified search result:', {
                source: unifiedResponse.data.source,
                query: unifiedResponse.data.query
            });
        } else {
            console.log('❌ Unified search error:', unifiedResponse.data.message);
        }

        // Test 6: Test multi-source search
        console.log('\n6. Testing multi-source search...');
        const multiResponse = await axios.post(`${BASE_URL}/search/multi`, {
            sources: ['wikipedia', 'arxiv'],
            query: 'Artificial Intelligence'
        });
        if (multiResponse.data.success) {
            console.log('✅ Multi-source result:', {
                sources: multiResponse.data.sources,
                hasWikipedia: !!multiResponse.data.data.wikipedia,
                hasArxiv: !!multiResponse.data.data.arxiv
            });
        } else {
            console.log('❌ Multi-source error:', multiResponse.data.message);
        }

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server. Make sure the backend is running on port 5000');
        } else {
            console.log('❌ Test failed:', error.message);
        }
    }
}

// Run the test
testAPI();