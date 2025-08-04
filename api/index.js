// api/index.js - Vercel Serverless Function Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Import Route Files
const userRoutes = require('../server/routes/userRoutes');
const problemRoutes = require('../server/routes/problemRoutes');
const ideaRoutes = require('../server/routes/ideaRoutes');
const quizRoutes = require('../server/routes/quizRoutes');
const fileRoutes = require('../server/routes/fileRoutes');

const app = express();

// --- Middleware ---
// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any vercel.app domain or your specific domain
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Parse JSON bodies
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  responseOnLimit: "File size limit has been reached"
})); // Handle file uploads

// Connect to MongoDB (with connection caching for serverless)
let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    
    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully');
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// --- Define API Routes ---
// Health check or landing message for the API
app.get('/', (req, res) => {
  res.send('🚀 EngineerConnect Backend API is running...');
});

app.get('/api', (req, res) => {
  res.json({ message: '🚀 EngineerConnect API is running...', timestamp: new Date().toISOString() });
});

// Use the route files for specific endpoints
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/files', fileRoutes);

// Direct leaderboard route (redirect to users leaderboard)
app.get('/api/leaderboard', (req, res) => {
  res.redirect('/api/users/leaderboard');
});

// TEST ENDPOINT directly
app.get('/api/test-server', (req, res) => {
  res.json({ message: 'Server test endpoint works!', timestamp: new Date().toISOString() });
});

// Middleware to ensure database connection before each request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

module.exports = app;
