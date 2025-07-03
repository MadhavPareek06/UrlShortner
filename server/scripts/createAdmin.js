const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@urlshortener.com',
      password: 'Admin123', // You can change this
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    };

    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('👤 Username:', adminData.username);
    console.log('🔑 Password:', adminData.password);
    console.log('');
    console.log('🚀 You can now login with these credentials and access the admin panel at /admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Also create a function to promote existing user to admin
const promoteToAdmin = async (username) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found:', username);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log('✅ User promoted to admin successfully!');
    console.log('👤 Username:', user.username);
    console.log('📧 Email:', user.email);
    console.log('👑 Role:', user.role);

  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'promote') {
  if (args[1]) {
    promoteToAdmin(args[1]);
  } else {
    console.log('Usage: node createAdmin.js promote <username>');
    process.exit(1);
  }
} else {
  createAdminUser();
}
