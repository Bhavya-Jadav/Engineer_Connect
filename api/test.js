// api/test.js - Simple test endpoint
module.exports = (req, res) => {
  res.json({ 
    message: 'API Test endpoint works!', 
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString() 
  });
};
