const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createSimpleUser() {
  try {
    console.log('🚀 Creating simple test user...');
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    // Delete existing users for fresh start
    await User.deleteMany({ username: { $in: ['testuser', 'company1'] } });
    console.log('✅ Cleared existing test users');
    
    // Create company user (simpler - no university required)
    console.log('👤 Creating company user...');
    
    const companyUser = new User({
      username: 'testcompany',
      email: 'test@company.com',
      password: 'password123', // Let the model hash this automatically
      role: 'company'
    });
    
    const savedUser = await companyUser.save();
    
    console.log('✅ Company user created successfully!');
    console.log('Username: testcompany');
    console.log('Password: password123');
    console.log('Role:', savedUser.role);
    console.log('ID:', savedUser._id);
    
    // Test the password using the model's method
    console.log('\n🔐 Testing password with model method...');
    const isMatch = await savedUser.matchPassword('password123');
    console.log('Password test:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    const wrongMatch = await savedUser.matchPassword('wrongpassword');
    console.log('Wrong password test:', wrongMatch ? '❌ FAIL (BAD!)' : '✅ PASS (GOOD!)');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createSimpleUser();
