// api/problems/index.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import modules inside the function
    const mongoose = require('mongoose');

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });
    }

    // Define Problem schema inline
    const problemSchema = new mongoose.Schema({
      title: String,
      description: String,
      category: String,
      priority: String,
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, default: 'open' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

    if (req.method === 'GET') {
      // Get all problems
      const problems = await Problem.find().populate('companyId', 'username companyName').sort({ createdAt: -1 });
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
      await newProblem.populate('companyId', 'username companyName');

      return res.status(201).json({
        message: 'Problem created successfully',
        problem: newProblem
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Problems API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
