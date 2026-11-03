const MenuItem = require('../models/MenuItem');
const menuData = require('../data/menuData');

const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany(menuData);
      console.log(`🌱 Seeded ${menuData.length} menu items`);
    } else {
      console.log(`ℹ️  Menu already has ${count} items — skipping seed`);
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }
};

module.exports = seedMenu;
