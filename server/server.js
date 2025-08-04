// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config(); // Load environment variables

// Import Route Files
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const quizRoutes = require('./routes/quizRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app', 'https://*.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI) // Removed deprecated options
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit process with failure
});

// --- Define API Routes ---
// Health check or landing message for the API
app.get('/', (req, res) => {
  res.send('🚀 EngineerConnect Backend API is running...');
});

// Use the route files for specific endpoints
// All routes defined in userRoutes.js will be prefixed with /api/users
app.use('/api/users', userRoutes);
// All routes defined in problemRoutes.js will be prefixed with /api/problems
app.use('/api/problems', problemRoutes);
// All routes defined in ideaRoutes.js will be prefixed with /api/ideas
app.use('/api/ideas', ideaRoutes);
// All routes defined in quizRoutes.js will be prefixed with /api/quiz
app.use('/api/quiz', quizRoutes);
// All routes defined in fileRoutes.js will be prefixed with /api/files
app.use('/api/files', fileRoutes);

// Direct leaderboard route (redirect to users leaderboard)
app.get('/api/leaderboard', (req, res) => {
  // Redirect to the actual leaderboard endpoint
  res.redirect('/api/users/leaderboard');
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});