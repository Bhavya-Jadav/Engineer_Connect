// api/index.js - Minimal API root health endpoint (ESM)
export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    message: '🚀 EngineerConnect API root',
    ok: true,
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/hello',
      '/api/test',
      '/api/debug',
      '/api/users/login',
      '/api/users/register',
      '/api/problems'
    ]
  });
}
