const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Check if admin exists
    const existing = await Admin.findOne({ email: 'admin@telehealth.com' });
    if (existing) {
      console.log('✅ Admin already exists');
      console.log('Email: admin@telehealth.com');
      console.log('\nYou can login at: http://localhost:3000/admin/login');
      process.exit(0);
    }
    
    // Create admin
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@telehealth.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    
    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: admin@telehealth.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nLogin at: http://localhost:3000/admin/login\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();


