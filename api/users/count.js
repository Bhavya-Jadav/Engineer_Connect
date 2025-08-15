import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
      // ...other fields...
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Get all users, sorted by name, only username and name fields
    const users = await User.find({}, { _id: 0, username: 1, name: 1 }).sort({ name: 1 });
    res.status(200).json({
      count: users.length,
      users: users.map(u => ({ username: u.username, name: u.name }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
