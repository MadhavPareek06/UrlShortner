// Simple test script to verify frontend-backend connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing frontend-backend connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Create a short URL
    console.log('\n2. Testing URL shortening...');
    const shortenResponse = await axios.post(`${API_BASE_URL}/shorten`, {
      originalUrl: 'https://www.example.com/very-long-url-for-testing',
      title: 'Test URL',
      description: 'This is a test URL for connection testing'
    });
    
    if (shortenResponse.data.success) {
      console.log('✅ URL shortening passed');
      console.log('   Short ID:', shortenResponse.data.data.shortId);
      console.log('   Short URL:', `http://localhost:5000/${shortenResponse.data.data.shortId}`);
      
      const shortId = shortenResponse.data.data.shortId;
      
      // Test 3: Get all URLs
      console.log('\n3. Testing get all URLs...');
      const urlsResponse = await axios.get(`${API_BASE_URL}/urls`);
      if (urlsResponse.data.success) {
        console.log('✅ Get URLs passed');
        console.log('   Total URLs:', urlsResponse.data.data.total);
      }
      
      // Test 4: Get specific URL
      console.log('\n4. Testing get specific URL...');
      const specificUrlResponse = await axios.get(`${API_BASE_URL}/urls/${shortId}`);
      if (specificUrlResponse.data.success) {
        console.log('✅ Get specific URL passed');
        console.log('   Original URL:', specificUrlResponse.data.data.originalUrl);
      }
      
      // Test 5: Get dashboard stats
      console.log('\n5. Testing dashboard stats...');
      const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      if (statsResponse.data.success) {
        console.log('✅ Dashboard stats passed');
        console.log('   Total URLs:', statsResponse.data.data.totalUrls);
        console.log('   Total Clicks:', statsResponse.data.data.totalClicks);
      }
      
      // Test 6: Delete the test URL
      console.log('\n6. Testing URL deletion...');
      const deleteResponse = await axios.delete(`${API_BASE_URL}/urls/${shortId}`);
      if (deleteResponse.data.success) {
        console.log('✅ URL deletion passed');
      }
      
    } else {
      console.log('❌ URL shortening failed:', shortenResponse.data.message);
    }
    
    console.log('\n🎉 All tests passed! Frontend-backend connection is working properly.');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: cd server && npm run dev');
    console.log('2. Start the frontend server: cd client && npm run dev');
    console.log('3. Open http://localhost:5173 in your browser');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd server && npm run dev');
    } else if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
