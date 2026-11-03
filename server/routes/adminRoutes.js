const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllProducts,
  getAllOrders,
  getOrderById,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/products', getAllProducts);
router.get('/orders', getAllOrders);
router.get('/orders/:id', validateObjectId, getOrderById);
router.get('/users', getUsers);
router.patch('/users/:id', validateObjectId, updateUser);
router.delete('/users/:id', validateObjectId, deleteUser);

module.exports = router;
