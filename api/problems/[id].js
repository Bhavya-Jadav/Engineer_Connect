// api/problems/[id].js - GET, PUT, DELETE single problem
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });
    }

    // Register Problem model if not present (must match server model)
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
      },
      { timestamps: true }
    );
    if (!mongoose.models.Problem) mongoose.model('Problem', problemSchema);
    const Problem = mongoose.models.Problem;

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

    if (req.method === 'GET') {
      const problem = await Problem.findById(id);
      if (!problem) return res.status(404).json({ message: 'Problem not found' });
      return res.status(200).json(problem);
    }

    if (req.method === 'PUT' || req.method === 'DELETE') {
      const authUser = getAuthUser();
      if (!authUser) return res.status(401).json({ message: 'Unauthorized' });
      if (!['admin', 'company'].includes(authUser.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const existing = await Problem.findById(id);
      if (!existing) return res.status(404).json({ message: 'Problem not found' });

      if (authUser.role === 'company' && String(existing.postedBy) !== String(authUser.userId)) {
        return res.status(403).json({ message: 'Not authorized for this problem' });
      }

      if (req.method === 'DELETE') {
        await Problem.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Problem deleted successfully' });
      }

      // PUT
      const { company, branch, title, description, videoUrl, difficulty, tags, quiz, attachments } = req.body || {};
      if (!company || !branch || !title || !description || !difficulty) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
      const normalizedTags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const updated = await Problem.findByIdAndUpdate(
        id,
        {
          company,
          branch,
          title,
          description,
          videoUrl: videoUrl || null,
          difficulty,
          tags: normalizedTags,
          attachments: Array.isArray(attachments) ? attachments : [],
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Problem [id] API error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Problem not found (Invalid ID format)' });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
