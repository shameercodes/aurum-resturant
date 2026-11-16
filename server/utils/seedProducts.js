const Product = require("../models/Product");
const CATALOG = require("./productCatalog");

module.exports = async function seedProducts() {
  let added = 0;
  let skipped = 0;

  for (const item of CATALOG) {
    // Check whether this product already exists.
    const existing = await Product.findOne({ name: item.name }).select("_id");

    if (existing) {
      // Never overwrite products managed by the admin.
      skipped += 1;
      continue;
    }

    // Insert only products that do not exist.
    await Product.create(item);
    added += 1;
  }

  const total = await Product.countDocuments();

  console.log(
    `✅ Product seeding complete: ${added} added, ${skipped} preserved (${total} total)`,
  );
};
