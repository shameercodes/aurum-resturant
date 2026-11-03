const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendReservationEmail } = require('../config/email');

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

// @desc    Create a new reservation (registered guests only)
// @route   POST /api/reservations
// @access  Private (any logged-in user)
exports.createReservation = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, date, time, guests, occasion, specialRequests } = req.body;

  if (req.user.email.toLowerCase() !== String(email).toLowerCase().trim()) {
    throw new AppError('Reservation email must match your account email', 400);
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    firstName, lastName, email, phone, date, time,
    guests: Number(guests), occasion, specialRequests,
  });

  // Send confirmation email (non-blocking — don't fail the request if email fails)
  sendReservationEmail(reservation).catch(err =>
    console.error('⚠️  Reservation email failed:', err.message)
  );

  res.status(201).json({
    success: true,
    message: 'Reservation received! A confirmation email has been sent.',
    data: {
      _id: reservation._id,
      fullName: reservation.fullName,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      occasion: reservation.occasion,
      status: reservation.status,
      createdAt: reservation.createdAt,
    },
  });
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
exports.getAllReservations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  if (req.query.status && VALID_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.email) filter.email = req.query.email.toLowerCase().trim();

  const reservations = await Reservation.find(filter).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private/Admin
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found', 404);
  res.status(200).json({ success: true, data: reservation });
});

// @desc    Update reservation status
// @route   PATCH /api/reservations/:id
// @access  Private/Admin
exports.updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Invalid status. Must be: ${VALID_STATUSES.join(', ')}`, 400);
  }
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id, { status }, { new: true, runValidators: true }
  );
  if (!reservation) throw new AppError('Reservation not found', 404);
  res.status(200).json({ success: true, data: reservation });
});

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);
  if (!reservation) throw new AppError('Reservation not found', 404);
  res.status(200).json({ success: true, message: 'Reservation deleted' });
});
