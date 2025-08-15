import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      name: String,
      password: String,
      // ...other fields...
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await User.updateMany({}, { password: hashedPassword });
    console.log(`Password for all users updated to 'admin123'.`);
    console.log('MongoDB update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
