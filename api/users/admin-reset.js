// api/users/admin-reset.js - Protected password reset endpoint
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-reset-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require a reset token header that matches env var
    const headerToken = req.headers['x-reset-token'] || req.headers['X-Reset-Token'];
    if (!process.env.RESET_TOKEN || headerToken !== process.env.RESET_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, newPassword } = req.body || {};
    if (!username || !newPassword) {
      return res.status(400).json({ error: 'username and newPassword are required' });
    }

    // Basic password sanity
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'newPassword must be at least 8 characters' });
    }

    // Connect to Mongo
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });
    }

    // Define User schema inline (keep consistent with other functions)
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      name: String,
      email: String,
      password: String,
      role: String,
      university: String,
      company: String,
      companyName: String,
      branch: String,
      points: { type: Number, default: 0 },
      bio: String,
      phone: String,
      course: String,
      year: String,
      profilePicture: String
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully', username });
  } catch (err) {
    console.error('Admin reset error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
