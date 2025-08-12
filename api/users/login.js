// api/users/login.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  console.log("LOGIN ENDPOINT HIT", req.method);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });
    }

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

    const { email: username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      companyName: user.companyName,
      branch: user.branch,
      points: user.points,
      bio: user.bio,
      phone: user.phone,
      course: user.course,
      year: user.year,
      profilePicture: user.profilePicture
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
