const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const debugAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check all users in database
    const users = await User.find({}).select('username email role isActive loginAttempts lockUntil');
    console.log('\n📋 All users in database:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 You need to register a user first.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
        console.log(`   Locked Until: ${user.lockUntil || 'Not locked'}`);
        console.log('   ' + '-'.repeat(30));
      });
    }

    // Reset all user accounts (unlock them)
    const resetResult = await User.updateMany(
      {},
      {
        $unset: { lockUntil: 1 },
        $set: { loginAttempts: 0, isActive: true }
      }
    );

    console.log(`\n🔓 Reset ${resetResult.modifiedCount} user accounts`);
    console.log('✅ All accounts are now unlocked and active');

    // Create a test user if no users exist
    if (users.length === 0) {
      console.log('\n🆕 Creating test user...');
      
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        isEmailVerified: true
      });

      await testUser.save();
      console.log('✅ Test user created:');
      console.log('   Username: testuser');
      console.log('   Email: test@example.com');
      console.log('   Password: Test123');
    }

    // Create admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('\n👑 Creating admin user...');
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created:');
      console.log('   Username: admin');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin123');
    }

    console.log('\n🚀 Authentication debug complete!');
    console.log('💡 Try logging in with the credentials above.');

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Also test password hashing
const testPasswordHashing = async () => {
  console.log('\n🔐 Testing password hashing...');
  
  const testPassword = 'Test123';
  const hashedPassword = await bcrypt.hash(testPassword, 12);
  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  
  console.log(`Original: ${testPassword}`);
  console.log(`Hashed: ${hashedPassword}`);
  console.log(`Validation: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
};

// Run debug
console.log('🔍 Starting authentication debug...');
testPasswordHashing().then(() => {
  debugAuth();
});
