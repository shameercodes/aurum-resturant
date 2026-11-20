const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  sendOrderConfirmation,
  sendOrderStatusEmail,
  sendAdminOrderNotification,
} = require("../config/email");

const { validateAddress } = require("../utils/fieldValidation");

const VALID_PAYMENT_METHODS = ["cod", "stripe", "mock"];

const VALID_STATUSES = [
  "pending",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// Only allow sensible forward transitions.
const STATUS_TRANSITIONS = {
  pending: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// CREATE ORDER
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  if (items.length > 50) {
    throw new AppError("Too many items in one order", 400);
  }

  const address = validateAddress(req.body.address);

  const selectedPayment = paymentMethod || "cod";

  if (!VALID_PAYMENT_METHODS.includes(selectedPayment)) {
    throw new AppError("Invalid payment method", 400);
  }

  // Combine duplicate products and validate quantities.
  const quantities = new Map();

  for (const item of items) {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const quantity = Number(item.quantity);

    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new AppError("Invalid product quantity", 400);
    }

    const productId = item.productId.toString();

    quantities.set(productId, (quantities.get(productId) || 0) + quantity);

    if (quantities.get(productId) > 100) {
      throw new AppError("Maximum quantity per product is 100", 400);
    }
  }

  const session = await mongoose.startSession();

  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const productIds = [...quantities.keys()];

      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).session(session);

      if (products.length !== productIds.length) {
        throw new AppError("One or more products are unavailable", 400);
      }

      const orderItems = [];
      let totalAmount = 0;

      for (const product of products) {
        const quantity = quantities.get(product._id.toString());

        // Atomic stock deduction.
        // The condition prevents stock from becoming negative.
        const result = await Product.updateOne(
          {
            _id: product._id,
            isActive: true,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          { session },
        );

        if (result.matchedCount !== 1) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        const lineTotal = product.price * quantity;

        totalAmount += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
        });
      }

      // Prices and totals always come from the database.
      // No payment method is automatically marked as paid.
      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            totalAmount,
            address,
            paymentMethod: selectedPayment,
            paymentStatus: "pending",
            status: "pending",
            statusHistory: [
              {
                status: "pending",
                changedBy: req.user._id,
                note: "Order placed",
              },
            ],
          },
        ],
        { session },
      );

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  // Send email only after the transaction commits.
  const populatedOrder = await Order.findById(createdOrder._id).populate(
    "user",
    "name email",
  );

  if (populatedOrder?.user?.email) {
    sendOrderConfirmation(populatedOrder.user, populatedOrder).catch(
      (error) => {
        console.error("Order confirmation email failed:", error.message);
      },
    );
  }

  if (populatedOrder) {
    sendAdminOrderNotification(populatedOrder).catch((error) => {
      console.error("Admin order notification failed:", error.message);
    });
  }

  res.status(201).json({
    success: true,
    data: createdOrder,
  });
});

// GET LOGGED-IN USER ORDERS
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// GET SINGLE ORDER
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("Not authorized", 403);
  }

  res.json({
    success: true,
    data: order,
  });
});

// GET ALL ORDERS (ADMIN)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    if (!VALID_STATUSES.includes(req.query.status)) {
      throw new AppError("Invalid order status filter", 400);
    }

    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// UPDATE ORDER STATUS (ADMIN)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];

      if (!allowedTransitions.includes(status)) {
        throw new AppError(
          `Cannot change order status from ${order.status} to ${status}`,
          400,
        );
      }

      if (status === "cancelled") {
        for (const item of order.items) {
          const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );

          if (result.matchedCount !== 1) {
            throw new AppError(
              `Cannot restore stock for ${item.name}: product not found`,
              409,
            );
          }
        }

        order.cancelledAt = new Date();
        order.cancellationReason =
          typeof cancellationReason === "string" && cancellationReason.trim()
            ? cancellationReason.trim().slice(0, 300)
            : "Cancelled by administrator";
      }

      order.status = status;

      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status,
        changedBy: req.user._id,
        note:
          status === "cancelled"
            ? order.cancellationReason
            : `Order ${status.replaceAll("_", " ")}`,
      });

      await order.save({ session });
      updatedOrder = order;
    });
  } finally {
    await session.endSession();
  }

  // Send notification after successful status update
  notifyOrderStatus(updatedOrder._id);

  res.json({
    success: true,
    data: updatedOrder,
  });
});

const notifyOrderStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("user", "name email");

    if (order?.user) {
      await sendOrderStatusEmail(order.user, order);
    }
  } catch (error) {
    console.error("Order status notification failed:", error.message);
  }
};

// CANCEL ORDER (CUSTOMER)
exports.cancelMyOrder = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body || {};

  const session = await mongoose.startSession();
  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).session(session);

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (!["pending", "preparing"].includes(order.status)) {
        throw new AppError("This order can no longer be cancelled", 400);
      }

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session },
        );

        if (result.matchedCount !== 1) {
          throw new AppError(
            `Cannot restore stock for ${item.name}: product not found`,
            409,
          );
        }
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancellationReason =
        typeof cancellationReason === "string" && cancellationReason.trim()
          ? cancellationReason.trim().slice(0, 300)
          : "Cancelled by customer";

      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: "cancelled",
        changedBy: req.user._id,
        note: order.cancellationReason,
      });

      await order.save({ session });
      cancelledOrder = order;
    });
  } finally {
    await session.endSession();
  }

  // Notify customer after successful cancellation
  notifyOrderStatus(cancelledOrder._id);

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: cancelledOrder,
  });
});
