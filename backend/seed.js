const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected to seed data...');

    // Check if the user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create the admin user
    const adminUser = new User({
      username: 'admin',
      password: 'jsw@2024',
      name: 'Admin User',
      role: 'Administrator'
    });

    await adminUser.save();
    console.log('Admin user successfully created in the database!');
    console.log('You can now log in with username "admin" and password "jsw@2024"');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAdminUser();
