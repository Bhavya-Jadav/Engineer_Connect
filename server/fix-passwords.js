const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixUserPasswords() {
  try {
    console.log('🔧 Fixing user passwords in TEST database...');
    
    // Connect to TEST database
    const testMongoUri = process.env.MONGO_URI; // Already updated to use test
    await mongoose.connect(testMongoUri);
    console.log('✅ Connected to TEST database');
    
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);
    
    console.log('\n🔐 Updating passwords...');
    console.log('=========================');
    
    for (const user of users) {
      let newPassword = 'password123'; // Default password
      
      // Special passwords for specific users
      if (user.username === 'testadmin') {
        newPassword = 'admin123';
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      
      console.log(`✅ Updated password for: ${user.username} (${user.role}) -> ${newPassword}`);
    }
    
    console.log('\n🧪 Testing passwords...');
    console.log('=======================');
    
    // Test a few logins
    const testUsers = ['testcompany', 'teststudent1', 'salman', 'Bhavya'];
    
    for (const username of testUsers) {
      const user = await User.findOne({ username });
      if (user) {
        const testPassword = username === 'testadmin' ? 'admin123' : 'password123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`${isMatch ? '✅' : '❌'} ${username}: ${isMatch ? 'PASS' : 'FAIL'}`);
      } else {
        console.log(`⚠️  ${username}: User not found`);
      }
    }
    
    console.log('\n🎉 Password reset completed!');
    console.log('\n📋 Login Credentials:');
    console.log('=====================');
    console.log('🏢 Company Users:');
    console.log('  • testcompany / password123');
    console.log('  • salman / password123');
    console.log('  • bvm / password123');
    console.log('\n🎓 Student Users:');
    console.log('  • teststudent1 / password123');
    console.log('  • teststudent2 / password123');
    console.log('  • demo / password123');
    console.log('  • meetvegad / password123');
    console.log('  • vrund / password123');
    console.log('  • hey / password123');
    console.log('\n👑 Admin Users:');
    console.log('  • Bhavya / password123');
    console.log('  • testadmin / admin123');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixUserPasswords();
