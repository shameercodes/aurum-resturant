const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Account required to make a reservation'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Minimum 1 guest required'],
      max: [20, 'Maximum 20 guests. Please call us for larger groups.'],
    },
    occasion: {
      type: String,
      default: 'None',
      trim: true,
      maxlength: [50, 'Occasion text too long'],
    },
    specialRequests: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
reservationSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for date-based queries
reservationSchema.index({ date: 1, status: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
