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
  getSalesAnalytics,
} = require("../controllers/adminController");
const {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get("/sales-analytics", getSalesAnalytics);
router.get('/products', getAllProducts);
router.get('/orders', getAllOrders);
router.get('/orders/:id', validateObjectId, getOrderById);
router.get('/users', getUsers);
router.patch('/users/:id', validateObjectId, updateUser);
router.delete('/users/:id', validateObjectId, deleteUser);

router.route('/tables')
  .post(createTable)
  .get(getAllTables);

router.route('/tables/:id')
  .patch(validateObjectId, updateTable)
  .delete(validateObjectId, deleteTable);

module.exports = router;
