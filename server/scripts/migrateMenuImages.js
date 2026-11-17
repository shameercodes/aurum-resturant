const mongoose = require("mongoose");
const Product = require("../models/Product");
const { cloudinary, connectCloudinary } = require("../config/cloudinary");
require("dotenv").config();

async function migrateProductImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    connectCloudinary();

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      try {
        // Skip images already hosted on Cloudinary.
        if (product.image?.includes("res.cloudinary.com")) {
          skipped++;
          console.log(`⏭️ Already migrated: ${product.name}`);
          continue;
        }

        if (!product.image) {
          failed++;
          console.log(`❌ Missing image: ${product.name}`);
          continue;
        }

        const result = await cloudinary.uploader.upload(product.image, {
          folder: "aurum/products",
          public_id: product._id.toString(),
          overwrite: true,
        });

        product.image = result.secure_url;
        await product.save();

        updated++;
        console.log(`✅ Updated: ${product.name}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed: ${product.name}`, error.message);
      }
    }

    console.log("\nMigration completed");
    console.log({ total: products.length, updated, skipped, failed });
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

migrateProductImages().catch((error) => {
  console.error("Migration error:", error);
  process.exitCode = 1;
});
