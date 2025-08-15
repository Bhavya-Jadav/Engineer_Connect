// reset-user-password.js
// Usage: node reset-user-password.js Bhavya newpassword123

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://bhavyajadav:bhavyajadav@bhavya.alzjfml.mongodb.net/';
const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
  console.error('Usage: node reset-user-password.js <username> <newPassword>');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function resetPassword() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false, maxPoolSize: 1 });
  console.log('MongoDB connected');

  const user = await User.findOne({ username });
  if (!user) {
    console.error('❌ No user found with username:', username);
    process.exit(1);
  }
  console.log('🔍 Current password hash in DB:', user.password);
  // Check if the new password is already hashed (should not be)
  if (user.password === newPassword) {
    console.error('❌ The new password is already set (no change).');
    process.exit(1);
  }
  // If the new password looks like a bcrypt hash, warn user
  if (/^\$2[aby]\$\d+\$/.test(newPassword)) {
    console.error('❌ The new password looks like a bcrypt hash. Please provide a plain password, not a hash.');
    process.exit(1);
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
  console.log('✅ Password reset successfully for user:', username);
  console.log('🔍 New password hash in DB:', user.password);
  process.exit(0);
}

resetPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
