// test-deployed-backend.js - Test your deployed backend API
const fetch = require('node-fetch');

const BACKEND_URL = 'http://backend-eosin-eight-92.vercel.app';

console.log('🔍 Testing Deployed Backend API...');
console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log('=' .repeat(60));

async function testAPI() {
  const tests = [];

  // Test 1: Basic API Health Check
  try {
    console.log('🏥 Testing API Health...');
    const response = await fetch(`${BACKEND_URL}/api/users/test-server`);
    const data = await response.text();
    
    if (response.ok) {
      console.log('✅ API Health Check: PASSED');
      console.log(`   Response: ${data}`);
      tests.push({ name: 'API Health', passed: true });
    } else {
      console.log('❌ API Health Check: FAILED');
      console.log(`   Status: ${response.status}, Response: ${data}`);
      tests.push({ name: 'API Health', passed: false });
    }
  } catch (error) {
    console.log('❌ API Health Check: ERROR');
    console.log(`   Error: ${error.message}`);
    tests.push({ name: 'API Health', passed: false });
  }

  // Test 2: CORS Headers
  try {
    console.log('\n🌐 Testing CORS Configuration...');
    const response = await fetch(`${BACKEND_URL}/api/users/test-server`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://your-frontend.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    if (response.ok) {
      console.log('✅ CORS Configuration: PASSED');
      console.log(`   Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin') || 'Not set'}`);
      tests.push({ name: 'CORS', passed: true });
    } else {
      console.log('❌ CORS Configuration: FAILED');
      tests.push({ name: 'CORS', passed: false });
    }
  } catch (error) {
    console.log('❌ CORS Configuration: ERROR');
    console.log(`   Error: ${error.message}`);
    tests.push({ name: 'CORS', passed: false });
  }

  // Test 3: Register Endpoint (POST)
  try {
    console.log('\n👤 Testing Register Endpoint...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      password: 'testpassword123',
      role: 'student',
      university: 'Test University'
    };

    const response = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Register Endpoint: PASSED');
      console.log(`   Created user: ${data.username}`);
      tests.push({ name: 'Register', passed: true });
    } else {
      console.log('❌ Register Endpoint: FAILED');
      console.log(`   Status: ${response.status}, Message: ${data.message}`);
      tests.push({ name: 'Register', passed: false });
    }
  } catch (error) {
    console.log('❌ Register Endpoint: ERROR');
    console.log(`   Error: ${error.message}`);
    tests.push({ name: 'Register', passed: false });
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  
  console.log(`🎯 BACKEND TEST RESULTS: ${passed}/${total} PASSED`);
  
  if (passed === total) {
    console.log('🎉 ALL BACKEND TESTS PASSED!');
    console.log('✅ Your backend is working correctly on Vercel');
    console.log('🌍 Ready for global mobile access');
    console.log('\n📱 Next Steps:');
    console.log('1. Deploy your frontend with the updated API URL');
    console.log('2. Test the complete application flow');
    console.log('3. Verify signup, login, and all features work');
  } else {
    console.log(`❌ ${total - passed} tests failed`);
    console.log('🔧 Check your backend deployment and environment variables');
  }
}

testAPI().catch(error => {
  console.error('❌ Test suite failed:', error);
});
