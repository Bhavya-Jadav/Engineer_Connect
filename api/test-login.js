// api/test-login.js - Simplified login test to isolate issues
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  console.log('🔍 LOGIN TEST - Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers),
    body: req.body
  });

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      expected: 'POST'
    });
  }

  try {
    console.log('🔍 Testing imports...');
    
    // Test mongoose import
    const mongoose = await import('mongoose');
    console.log('✅ Mongoose imported successfully');
    
    // Test bcrypt import
    const bcrypt = await import('bcryptjs');
    console.log('✅ Bcrypt imported successfully');
    
    // Test jwt import
    const jwt = await import('jsonwebtoken');
    console.log('✅ JWT imported successfully');
    
    console.log('🔍 Environment check...');
    console.log('MONGO_URI set:', !!process.env.MONGO_URI);
    console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
    
    const response = {
      message: '✅ Login test endpoint working!',
      method: req.method,
      bodyReceived: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      environment: {
        mongoUriSet: !!process.env.MONGO_URI,
        jwtSecretSet: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      imports: {
        mongoose: 'SUCCESS',
        bcrypt: 'SUCCESS',
        jwt: 'SUCCESS'
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Sending success response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Login test error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
