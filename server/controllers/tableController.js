const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @desc    Create restaurant table
// @route   POST /api/admin/tables
// @access  Private/Admin
exports.createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, location, description } = req.body;

  if (!tableNumber || !capacity) {
    throw new AppError("Table number and capacity are required", 400);
  }

  const existingTable = await Table.findOne({
    tableNumber: String(tableNumber).trim(),
  });

  if (existingTable) {
    throw new AppError("This table number already exists", 400);
  }

  const table = await Table.create({
    tableNumber,
    capacity: Number(capacity),
    location,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Restaurant table created successfully",
    data: table,
  });
});

// @desc    Get all restaurant tables
// @route   GET /api/admin/tables
// @access  Private/Admin
exports.getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });

  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables,
  });
});

// @desc    Update restaurant table
// @route   PATCH /api/admin/tables/:id
// @access  Private/Admin
exports.updateTable = asyncHandler(async (req, res) => {
  const allowedFields = [
    "tableNumber",
    "capacity",
    "location",
    "status",
    "description",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.capacity !== undefined) {
    updates.capacity = Number(updates.capacity);
  }

const table = await Table.findById(req.params.id);

if (!table) {
  throw new AppError("Table not found", 404);
}

// Prevent duplicate table numbers
if (updates.tableNumber) {
  const existingTable = await Table.findOne({
    tableNumber: String(updates.tableNumber).trim(),
    _id: { $ne: table._id },
  });

  if (existingTable) {
    throw new AppError("This table number already exists", 400);
  }
}

// Check active reservations
const activeReservations = await Reservation.find({
  table: table._id,
  status: { $in: ["pending", "confirmed", "seated"] },
});

// Prevent reducing capacity below existing guest counts
if (updates.capacity !== undefined) {
  const conflictingReservation = activeReservations.find(
    (reservation) => reservation.guests > updates.capacity,
  );

  if (conflictingReservation) {
    throw new AppError(
      "Cannot reduce capacity because this table has an active reservation for more guests",
      400,
    );
  }
}

// Prevent disabling a table with active reservations
if (updates.status === "unavailable" && activeReservations.length > 0) {
  throw new AppError("Cannot disable a table with active reservations", 400);
}

Object.assign(table, updates);
await table.save();


  res.status(200).json({
    success: true,
    message: "Table updated successfully",
    data: table,
  });
});

// @desc    Delete restaurant table
// @route   DELETE /api/admin/tables/:id
// @access  Private/Admin
exports.deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new AppError("Table not found", 404);
  }

 const existingReservations = await Reservation.exists({
   table: table._id,
 });

 if (existingReservations) {
   throw new AppError(
     "Cannot delete a table linked to reservation records. Mark it unavailable instead.",
     400,
   );
 }

 await table.deleteOne();

  res.status(200).json({
    success: true,
    message: "Table deleted successfully",
  });
});
