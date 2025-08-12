// api/debug.js - Debug endpoint to diagnose issues
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        MONGO_URI_SET: !!process.env.MONGO_URI,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
      },
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Test if we can import dependencies
    try {
      const mongoose = await import('mongoose');
      debugInfo.mongoose_import = 'SUCCESS';
      debugInfo.mongoose_version = mongoose.version;
    } catch (error) {
      debugInfo.mongoose_import = 'FAILED';
      debugInfo.mongoose_error = error.message;
    }

    try {
      const bcrypt = await import('bcryptjs');
      debugInfo.bcrypt_import = 'SUCCESS';
    } catch (error) {
      debugInfo.bcrypt_import = 'FAILED';
      debugInfo.bcrypt_error = error.message;
    }

    try {
      const jwt = await import('jsonwebtoken');
      debugInfo.jwt_import = 'SUCCESS';
    } catch (error) {
      debugInfo.jwt_import = 'FAILED';
      debugInfo.jwt_error = error.message;
    }

    res.status(200).json({
      message: '🔍 Debug information',
      debug: debugInfo
    });

  } catch (error) {
    res.status(500).json({
      message: '❌ Debug endpoint error',
      error: error.message,
      stack: error.stack
    });
  }
}
