import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      name: String,
      // ...other fields...
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const users = await User.find({}, { _id: 0, username: 1, name: 1 }).sort({ name: 1 });
    console.log({
      count: users.length,
      users: users.map(u => ({ username: u.username, name: u.name }))
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
