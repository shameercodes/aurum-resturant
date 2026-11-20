const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  sendReservationEmail,
  sendReservationStatusEmail,
} = require("../config/email");

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
  "seated",
  "completed",
];

const ACTIVE_STATUSES = ["pending", "confirmed", "seated"];

const RESERVATION_DURATION = 90;

// @desc    Create a new reservation (registered guests only)
// @route   POST /api/reservations
// @access  Private (any logged-in user)

// Convert HH:mm into minutes from midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Validate YYYY-MM-DD
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
};

// Validate HH:mm
const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
};

exports.createReservation = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    date,
    time,
    guests,
    occasion,
    specialRequests,
  } = req.body;

  // Verify reservation email
  if (req.user.email.toLowerCase() !== String(email).toLowerCase().trim()) {
    throw new AppError("Reservation email must match your account email", 400);
  }

  // Validate date and time
  if (!isValidDate(date)) {
    throw new AppError("Please provide a valid date in YYYY-MM-DD format", 400);
  }

  if (!isValidTime(time)) {
    throw new AppError("Please provide a valid time in HH:mm format", 400);
  }

  // Prevent past reservations (Pakistan local time)
  const now = new Date();
  const pakistanTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
  );

  const today = [
    pakistanTime.getFullYear(),
    String(pakistanTime.getMonth() + 1).padStart(2, "0"),
    String(pakistanTime.getDate()).padStart(2, "0"),
  ].join("-");

  const currentTime = pakistanTime.getHours() * 60 + pakistanTime.getMinutes();

  if (date < today) {
    throw new AppError("You cannot book a reservation in the past", 400);
  }

  if (date === today && timeToMinutes(time) <= currentTime) {
    throw new AppError("Please select a future reservation time", 400);
  }

  // Validate guest count
  const guestCount = Number(guests);

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    throw new AppError("Guest count must be a positive whole number", 400);
  }

  const requestedStart = timeToMinutes(time);
  const requestedEnd = requestedStart + RESERVATION_DURATION;

  if (requestedEnd > 1440) {
    throw new AppError("Reservation must finish before midnight", 400);
  }

  const session = await Reservation.startSession();

  let reservation;
  let assignedTable;

  try {
    await session.withTransaction(async () => {
      // Find suitable tables
      const suitableTables = await Table.find({
        capacity: { $gte: guestCount },
        status: "available",
      })
        .sort({ capacity: 1 })
        .session(session)
        .lean();

      if (!suitableTables.length) {
        throw new AppError(
          "No suitable tables are available for this guest count",
          409,
        );
      }

      // Try tables in smallest-capacity-first order
      for (const table of suitableTables) {
        // Atomically update the table document.
        // Concurrent transactions attempting the same table
        // will conflict and MongoDB can retry the transaction.
        const lockedTable = await Table.findOneAndUpdate(
          {
            _id: table._id,
            status: "available",
            bookingVersion: table.bookingVersion,
          },
          {
            $inc: { bookingVersion: 1 },
          },
          {
            new: true,
            session,
          },
        );

        if (!lockedTable) {
          continue;
        }

        // Check existing active reservations
        const existingReservations = await Reservation.find({
          date,
          table: lockedTable._id,
          status: { $in: ACTIVE_STATUSES },
        })
          .select("time")
          .session(session)
          .lean();

        const hasConflict = existingReservations.some((existing) => {
          if (!isValidTime(existing.time)) {
            return true;
          }

          const existingStart = timeToMinutes(existing.time);
          const existingEnd = existingStart + RESERVATION_DURATION;

          return requestedStart < existingEnd && requestedEnd > existingStart;
        });

        if (hasConflict) {
          continue;
        }

        // Create reservation
        const created = await Reservation.create(
          [
            {
              user: req.user._id,
              firstName,
              lastName,
              email,
              phone,
              date,
              time,
              guests: guestCount,
              occasion,
              specialRequests,
              table: lockedTable._id,
            },
          ],
          { session },
        );

        reservation = created[0];
        assignedTable = lockedTable;
        break;
      }

      if (!reservation) {
        throw new AppError(
          "No tables are available at this time. Please choose another time.",
          409,
        );
      }
    });
  } finally {
    await session.endSession();
  }

  // Send email only after transaction successfully commits
sendReservationEmail(reservation, assignedTable).catch((err) =>
  console.error("⚠️ Reservation email failed:", err.message),
);

  // Return reservation details
  res.status(201).json({
    success: true,
    message: "Reservation received! Your booking is pending confirmation.",
    data: {
      _id: reservation._id,
      fullName: reservation.fullName,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      table: reservation.table,
      tableNumber: assignedTable.tableNumber,
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
  if (req.query.status && VALID_STATUSES.includes(req.query.status))
    filter.status = req.query.status;
  if (req.query.email) filter.email = req.query.email.toLowerCase().trim();

  const reservations = await Reservation.find(filter)
    .populate("table", "tableNumber capacity location")
    .sort({ createdAt: -1 })
    .lean();
  res
    .status(200)
    .json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private/Admin
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate(
    "table",
    "tableNumber capacity location",
  );
  if (!reservation) throw new AppError("Reservation not found", 404);
  res.status(200).json({ success: true, data: reservation });
});


// @desc    Update reservation status
// @route   PATCH /api/reservations/:id
// @access  Private/Admin
exports.updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedAdminStatuses = [
    "confirmed",
    "rejected",
    "seated",
    "completed",
    "cancelled",
  ];

  if (!allowedAdminStatuses.includes(status)) {
    throw new AppError("Invalid reservation status", 400);
  }

  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (["rejected", "cancelled", "completed"].includes(reservation.status)) {
    throw new AppError(
      `Cannot update a reservation that is already ${reservation.status}`,
      400,
    );
  }

  if (
    ["confirmed", "rejected"].includes(status) &&
    reservation.status !== "pending"
  ) {
    throw new AppError(
      "Only pending reservations can be confirmed or rejected",
      400,
    );
  }

  reservation.status = status;
  await reservation.save();

  const updatedReservation = await Reservation.findById(
    reservation._id,
  ).populate("table", "tableNumber capacity location");

  // Send email when admin confirms or rejects reservation
  if (["confirmed", "rejected"].includes(status)) {
    sendReservationStatusEmail(updatedReservation).catch((err) =>
      console.error("⚠️ Reservation status email failed:", err.message),
    );
  }

  // Return the updated reservation.
  res.status(200).json({
    success: true,
    message: `Reservation ${status} successfully`,
    data: updatedReservation,
  });
});


// @desc    Delete a reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  await reservation.deleteOne();

  res.status(200).json({
    success: true,
    message: "Reservation deleted successfully",
  });
});