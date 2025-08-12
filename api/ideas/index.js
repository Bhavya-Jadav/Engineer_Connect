// api/ideas/index.js (Vercel serverless) - student idea submission and admin/company listing
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });
    }

    // Schemas matching server models
    const userSchema = new mongoose.Schema({ role: String, username: String });
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const problemSchema = new mongoose.Schema({ title: String, postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } });
    if (!mongoose.models.Problem) mongoose.model('Problem', problemSchema);
    const Problem = mongoose.models.Problem;

    const ideaSchema = new mongoose.Schema(
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
        ideaText: { type: String, required: true },
        implementationApproach: { type: String },
      },
      { timestamps: true }
    );
    if (!mongoose.models.Idea) mongoose.model('Idea', ideaSchema);
    const Idea = mongoose.models.Idea;

    // Helper: JWT auth
    const getAuthUser = () => {
      try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token) return null;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: payload.id || payload.userId, role: payload.role };
      } catch (_) {
        return null;
      }
    };

    if (req.method === 'POST') {
      const authUser = getAuthUser();
      if (!authUser) return res.status(401).json({ message: 'Unauthorized' });
      if (authUser.role !== 'student') return res.status(403).json({ message: 'Only students can submit ideas' });

      const { problemId, ideaText, implementationApproach } = req.body || {};
      if (!problemId || !ideaText) {
        return res.status(400).json({ message: 'Problem ID and idea text are required' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) return res.status(404).json({ message: 'Problem not found' });

      const existing = await Idea.findOne({ student: authUser.userId, problem: problemId });
      if (existing) return res.status(400).json({ message: 'You have already submitted an idea for this problem.' });

      const idea = new Idea({
        student: authUser.userId,
        problem: problemId,
        ideaText: ideaText.trim(),
        implementationApproach: (implementationApproach || '').trim(),
      });

      const created = await idea.save();
      return res.status(201).json(created);
    }

    if (req.method === 'GET') {
      // Admin or company listing by problem id (?problemId=...)
      const authUser = getAuthUser();
      if (!authUser) return res.status(401).json({ message: 'Unauthorized' });
      if (!['admin', 'company'].includes(authUser.role)) return res.status(403).json({ message: 'Access denied' });

      const { problemId } = req.query || {};
      if (!problemId) return res.status(400).json({ message: 'problemId query is required' });

      const problem = await Problem.findById(problemId);
      if (!problem) return res.status(404).json({ message: 'Problem not found' });

      if (authUser.role === 'company' && String(problem.postedBy) !== String(authUser.userId)) {
        return res.status(403).json({ message: 'Access denied. You can only view ideas for your own problems.' });
      }

      const ideas = await mongoose.models.Idea.find({ problem: problemId })
        .select('ideaText implementationApproach student createdAt')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json(ideas);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ideas API error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
