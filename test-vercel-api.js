// test-vercel-api.js - Test script to verify all API endpoints
console.log('🔍 Testing Vercel API endpoints...');

const BASE_URL = 'https://engineer-connect.vercel.app/api';

async function testEndpoint(url, options = {}) {
  try {
    console.log(`\n📡 Testing: ${url}`);
    const response = await fetch(url, options);
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    const data = await response.json();
    console.log(`   Response:`, data);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test 1: Basic API health
  await testEndpoint(`${BASE_URL}/test`);
  
  // Test 2: Hello endpoint
  await testEndpoint(`${BASE_URL}/hello`);
  
  // Test 3: Problems endpoint
  await testEndpoint(`${BASE_URL}/problems`);
  
  // Test 4: Login endpoint with test data
  await testEndpoint(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test', password: 'test' })
  });
  
  console.log('\n✅ API tests completed!');
}

runTests();
