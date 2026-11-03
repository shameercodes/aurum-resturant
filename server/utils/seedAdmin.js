/**
 * Creates the default admin account if none exists.
 * Run once after first DB connection, or call manually:
 *   node -e "require('dotenv').config(); require('./utils/seedAdmin')()"
 *
 * DEFAULT CREDENTIALS (change immediately after first login):
 *   Email:    admin@aurumrestaurant.co.uk
 *   Password: Aurum@Admin2025
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@aurumrestaurant.co.uk';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aurum@Admin2025';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Aurum Admin';

async function seedAdmin() {
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      return;
    }
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });
    console.log(`✅ Admin created → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('⚠️  Change the password immediately after first login!');
  } catch (err) {
    console.error('❌ seedAdmin error:', err.message);
  }
}

// Auto-run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aurum_restaurant')
    .then(seedAdmin)
    .then(() => mongoose.disconnect())
    .catch(err => { console.error(err); process.exit(1); });
} else {
  module.exports = seedAdmin;
}
