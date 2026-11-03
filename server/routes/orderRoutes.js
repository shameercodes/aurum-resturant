const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimiter');

router.post('/', writeLimiter, protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, validateObjectId, getOrder);
router.patch('/:id/status', protect, authorize('admin'), validateObjectId, updateOrderStatus);

module.exports = router;
