const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description too long'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Pizza', 'Burgers', 'Drinks', 'Desserts'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, name: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
