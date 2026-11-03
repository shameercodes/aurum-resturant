const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['starters', 'mains', 'desserts', 'cocktails'],
        message: '{VALUE} is not a valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [10000, 'Price seems too high'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    badges: {
      type: [String],
      default: [],
    },
    spiceLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast category filtering
menuItemSchema.index({ category: 1, name: 1 });
menuItemSchema.index({ featured: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
