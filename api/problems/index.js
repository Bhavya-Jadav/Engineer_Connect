// api/problems/index.js
const mongoose = require('mongoose');

// Import Problem model
const Problem = require('../../server/models/Problem');

// Connect to MongoDB
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    isConnected = true;
    console.log('✅ MongoDB connected for problems');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get all problems
      const problems = await Problem.find().populate('companyId', 'name').sort({ createdAt: -1 });
      return res.status(200).json(problems);
    }

    if (req.method === 'POST') {
      // Create new problem (company only)
      const { title, description, category, priority, companyId } = req.body;

      if (!title || !description || !category || !companyId) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const newProblem = new Problem({
        title,
        description,
        category,
        priority: priority || 'medium',
        companyId,
        status: 'open'
      });

      await newProblem.save();
      await newProblem.populate('companyId', 'name');

      return res.status(201).json({
        message: 'Problem created successfully',
        problem: newProblem
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Problems API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
