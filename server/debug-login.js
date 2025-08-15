// debug-login.js
// Run this script with: node debug-login.js
// It will help you diagnose why login is failing for a given username

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://bhavyajadav:bhavyajadav@bhavya.alzjfml.mongodb.net/';
const TEST_USERNAME = process.argv[2] || 'Bhavya';
const TEST_PASSWORD = process.argv[3] || 'your_actual_password';

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

async function debugLogin() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false, maxPoolSize: 1 });
  console.log('MongoDB connected');

  const user = await User.findOne({ username: TEST_USERNAME });
  if (!user) {
    console.log('❌ No user found with username:', TEST_USERNAME);
    process.exit(1);
  }
  console.log('✅ User found:', user.username);
  console.log('Password hash in DB:', user.password);

  const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, user.password);
  if (isPasswordValid) {
    console.log('✅ Password is valid! Login would succeed.');
  } else {
    console.log('❌ Password is INVALID! Login would fail.');
  }
  process.exit(0);
}

debugLogin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
