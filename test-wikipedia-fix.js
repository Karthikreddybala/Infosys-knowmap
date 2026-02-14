/**
 * Test script to verify Wikipedia API fix
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testWikipediaFix() {
    console.log('🧪 Testing Wikipedia API fix...\n');

    try {
        // Test Wikipedia search
        console.log('Testing Wikipedia search...');
        const response = await axios.get(`${BASE_URL}/search/wikipedia?q=Artificial+Intelligence&pageSize=3`);
        
        if (response.data.success) {
            console.log('✅ Wikipedia API is working!');
            console.log('Result:', {
                title: response.data.data.title,
                hasImage: !!response.data.data.imageUrl,
                hasExtract: response.data.data.extract.length > 0,
                source: response.data.source
            });
        } else {
            console.log('❌ Wikipedia API still failing:', response.data.message);
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server. Make sure the backend is running on port 5000');
        } else {
            console.log('❌ Test failed:', error.message);
        }
    }
}

// Run the test
testWikipediaFix();