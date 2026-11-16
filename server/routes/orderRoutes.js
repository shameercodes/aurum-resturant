const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { writeLimiter } = require("../middleware/rateLimiter");

router.post("/", writeLimiter, protect, createOrder);

router.get("/my", protect, getMyOrders);

router.get("/all", protect, authorize("admin"), getAllOrders);

// Customer cancellation
router.patch(
  "/:id/cancel",
  writeLimiter,
  protect,
  validateObjectId,
  cancelMyOrder,
);

// Admin order status update
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  validateObjectId,
  updateOrderStatus,
);

router.get("/:id", protect, validateObjectId, getOrder);

module.exports = router;
