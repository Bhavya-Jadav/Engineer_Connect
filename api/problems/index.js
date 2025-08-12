// api/problems/index.js (Vercel serverless) - unified with backend schema
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

    // Problem schema matching server/models/Problem.js
    const problemSchema = new mongoose.Schema(
      {
        company: { type: String, required: true, trim: true },
        branch: {
          type: String,
          required: true,
          enum: ['computer', 'mechanical', 'electrical', 'civil', 'chemical', 'aerospace'],
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        videoUrl: { type: String, default: null },
        attachments: [
          {
            fileName: { type: String, required: true },
            originalName: { type: String, required: true },
            fileType: {
              type: String,
              required: true,
              enum: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'other'],
            },
            fileSize: { type: Number, required: true },
            filePath: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
          },
        ],
        difficulty: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
        tags: [{ type: String, trim: true }],
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        postedAt: { type: Date, default: Date.now },
        views: { type: Number, default: 0 },
        quiz: {
          enabled: { type: Boolean, default: false },
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          questions: [
            {
              question: { type: String, required: true, trim: true },
              type: { type: String, required: true, enum: ['multiple-choice', 'text', 'boolean'] },
              options: [
                {
                  text: { type: String, required: true },
                  isCorrect: { type: Boolean, default: false },
                },
              ],
              correctAnswer: { type: String },
              points: { type: Number, default: 1 },
            },
          ],
          timeLimit: { type: Number, default: 30 },
          passingScore: { type: Number, default: 70 },
        },
      },
      { timestamps: true }
    );

    const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

    // Helper to parse JWT from Authorization header
    const getAuthUser = () => {
      try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token) return null;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Support both { id } and { userId }
        const userId = payload.id || payload.userId;
        const role = payload.role;
        return { userId, role };
      } catch (_) {
        return null;
      }
    };

    if (req.method === 'GET') {
      const { branch } = req.query || {};
      const filter = branch ? { branch } : {};
      const problems = await Problem.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(problems);
    }

    if (req.method === 'POST') {
      const authUser = getAuthUser();
      if (!authUser) return res.status(401).json({ message: 'Unauthorized' });
      if (!['admin', 'company'].includes(authUser.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { company, branch, title, description, videoUrl, difficulty, tags, quiz, attachments } = req.body || {};

      if (!company || !branch || !title || !description || !difficulty) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      // Normalize tags
      const normalizedTags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // Validate quiz if enabled (basic checks)
      let quizData = { enabled: false, questions: [] };
      if (quiz && quiz.enabled) {
        if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
          return res.status(400).json({ message: 'Quiz is enabled but no questions provided' });
        }
        for (const q of quiz.questions) {
          if (!q.question || !q.type) {
            return res.status(400).json({ message: 'Each quiz question must have a question text and type' });
          }
          if (q.type === 'multiple-choice') {
            if (!Array.isArray(q.options) || q.options.length < 2) {
              return res.status(400).json({ message: 'Multiple choice questions must have at least 2 options' });
            }
            const correct = q.options.filter((o) => o.isCorrect);
            if (correct.length !== 1) {
              return res.status(400).json({ message: 'Multiple choice questions must have exactly one correct answer' });
            }
          } else if ((q.type === 'text' || q.type === 'boolean') && !q.correctAnswer) {
            return res.status(400).json({ message: `${q.type} questions must have a correct answer` });
          }
        }
        quizData = {
          enabled: true,
          title: quiz.title || `${title} Quiz`,
          description: quiz.description || 'Complete this quiz to submit your idea',
          questions: quiz.questions,
          timeLimit: quiz.timeLimit || 30,
          passingScore: quiz.passingScore || 70,
        };
      }

      const problem = new Problem({
        company,
        branch,
        title,
        description,
        videoUrl: videoUrl || null,
        difficulty,
        tags: normalizedTags,
        postedBy: authUser.userId,
        quiz: quizData,
        attachments: Array.isArray(attachments) ? attachments : [],
      });

      const created = await problem.save();
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Problems API error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
