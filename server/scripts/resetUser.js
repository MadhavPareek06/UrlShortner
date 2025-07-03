const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const resetUserAccount = async (identifier) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      console.log('❌ User not found:', identifier);
      process.exit(1);
    }

    // Reset account locks and login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.isActive = true;
    
    await user.save();

    console.log('✅ User account reset successfully!');
    console.log('👤 Username:', user.username);
    console.log('📧 Email:', user.email);
    console.log('🔓 Login attempts reset to 0');
    console.log('🔓 Account unlocked');
    console.log('');
    console.log('🚀 You can now try logging in again');

  } catch (error) {
    console.error('❌ Error resetting user account:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get username/email from command line
const identifier = process.argv[2];
if (!identifier) {
  console.log('Usage: node resetUser.js <username_or_email>');
  console.log('Example: node resetUser.js DerenCageitis07');
  process.exit(1);
}

resetUserAccount(identifier);
