/**
 * Script to create an initial admin user
 * Run: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../src/models/Admin');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Get admin details from user
    console.log('\n📝 Creating Admin User\n');
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const role = await question('Enter role (admin/superadmin) [default: admin]: ') || 'admin';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role === 'superadmin' ? 'superadmin' : 'admin'
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🔑 Login at: http://localhost:3000/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();

