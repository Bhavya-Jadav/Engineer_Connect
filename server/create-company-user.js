const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createCompanyUser() {
  try {
    console.log('🚀 Creating company user for testing...');
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'company1' });
    if (existingUser) {
      console.log('❌ User "company1" already exists');
      // Delete existing user for fresh start
      await User.deleteOne({ username: 'company1' });
      console.log('✅ Deleted existing user');
    }
    
    // Create new company user (no university required)
    const password = 'test123';
    
    console.log('👤 Creating company user...');
    
    // Hash password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Password to hash:', password);
    console.log('Generated hash:', hashedPassword);
    
    // Create user directly
    const newUser = new User({
      username: 'company1',
      email: 'company@test.com',
      password: hashedPassword,
      role: 'company'
    });
    
    const savedUser = await newUser.save();
    
    console.log('✅ Company user created successfully!');
    console.log('Username: company1');
    console.log('Password: test123');
    console.log('Role:', savedUser.role);
    console.log('ID:', savedUser._id);
    
    // Test login
    console.log('\n🔐 Testing password comparison...');
    const testPassword = 'test123';
    const isMatch = await bcrypt.compare(testPassword, savedUser.password);
    console.log(`Testing "${testPassword}" against stored hash:`, isMatch ? '✅ PASS' : '❌ FAIL');
    
    // Also test wrong password
    const wrongMatch = await bcrypt.compare('wrongpassword', savedUser.password);
    console.log('Testing wrong password:', wrongMatch ? '✅ PASS (BAD!)' : '❌ FAIL (GOOD!)');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createCompanyUser();
