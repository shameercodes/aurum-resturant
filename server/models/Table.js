const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      unique: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Table must have at least one seat"],
      max: [20, "Table capacity cannot exceed 20"],
    },

    location: {
      type: String,
      enum: ["indoor", "outdoor", "window", "private"],
      default: "indoor",
    },

    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    bookingVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

tableSchema.index({ capacity: 1, status: 1 });

module.exports = mongoose.model("Table", tableSchema);
