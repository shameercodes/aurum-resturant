const Product = require('../models/Product');
const CATALOG = require('./productCatalog');

module.exports = async function seedProducts() {
  let added = 0;
  let updated = 0;

  for (const item of CATALOG) {
    const existing = await Product.findOne({ name: item.name });
    if (existing) {
      existing.description = item.description;
      existing.price = item.price;
      existing.category = item.category;
      existing.image = item.image;
      existing.rating = item.rating;
      existing.stock = item.stock;
      await existing.save();
      updated += 1;
    } else {
      await Product.create(item);
      added += 1;
    }
  }

  const total = await Product.countDocuments();
  console.log(`✅ Menu sync: ${added} added, ${updated} updated (${total} total)`);
};
