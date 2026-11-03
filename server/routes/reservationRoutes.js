const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, getReservationById, updateReservationStatus, deleteReservation } = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .post(writeLimiter, protect, createReservation)
  .get(protect, authorize('admin'), getAllReservations);

router.route('/:id')
  .get(protect, authorize('admin'), validateObjectId, getReservationById)
  .patch(protect, authorize('admin'), validateObjectId, updateReservationStatus)
  .delete(protect, authorize('admin'), validateObjectId, deleteReservation);

module.exports = router;
