const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    type: {
      type: String,
      enum: ["restaurant", "product"],
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5.",
      },
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "pending",
    },

    adminReply: {
      message: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },
      repliedAt: {
        type: Date,
        default: null,
      },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
  },
  { timestamps: true },
);

// One restaurant review per customer per order.
reviewSchema.index(
  { user: 1, order: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "restaurant" },
  },
);

// One product review per customer per product per order.
reviewSchema.index(
  { user: 1, order: 1, product: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "product" },
  },
);

// Efficient public review queries.
reviewSchema.index({ status: 1, type: 1, createdAt: -1 });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
