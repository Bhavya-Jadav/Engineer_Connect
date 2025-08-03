const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('❌ User "testuser" already exists');
      process.exit(1);
    }
    
    // Create new user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      branch: 'Computer Science',
      university: 'Test University'
    };
    
    console.log('👤 Creating user with data:', {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      branch: userData.branch
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('Username: testuser');
    console.log('Password: password123');
    console.log('Role:', savedUser.role);
    console.log('ID:', savedUser._id);
    
    // Test login
    console.log('\n🔐 Testing password...');
    const isMatch = await bcrypt.compare('password123', savedUser.password);
    console.log('Password test:', isMatch ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createTestUser();
