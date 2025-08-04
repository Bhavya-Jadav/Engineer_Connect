// api/index.js - Vercel Serverless Function Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Import Route Files - using relative paths
const userRoutes = require('../server/routes/userRoutes');
const problemRoutes = require('../server/routes/problemRoutes');
const ideaRoutes = require('../server/routes/ideaRoutes');
const quizRoutes = require('../server/routes/quizRoutes');
const fileRoutes = require('../server/routes/fileRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: "File size limit has been reached"
}));

// Connect to MongoDB with caching for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Health check
app.get('/api', (req, res) => {
  res.json({ message: '🚀 EngineerConnect API is running...', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/files', fileRoutes);

// Export handler for Vercel
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
