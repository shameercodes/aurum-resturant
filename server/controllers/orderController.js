const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendOrderConfirmation } = require('../config/email');
const { validateAddress } = require('../utils/fieldValidation');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;
  if (!items?.length) throw new AppError('Cart is empty', 400);
  const address = validateAddress(req.body.address);

  const validPayment = ['cod', 'stripe', 'mock'];
  if (paymentMethod && !validPayment.includes(paymentMethod)) {
    throw new AppError('Invalid payment method', 400);
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    if (!item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      throw new AppError('Each item must have a product and valid quantity', 400);
    }
    const qty = Math.floor(Number(item.quantity));
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) throw new AppError(`Product not available: ${item.productId}`, 400);
    if (product.stock < qty) throw new AppError(`Insufficient stock for ${product.name}`, 400);

    const lineTotal = product.price * qty;
    totalAmount += lineTotal;
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    address,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'mock' || paymentMethod === 'stripe' ? 'paid' : 'pending',
    status: 'pending',
  });

  const populated = await Order.findById(order._id).populate('user', 'name email');
  sendOrderConfirmation(populated.user, populated).catch(() => {});

  res.status(201).json({ success: true, data: order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: orders.length, data: orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }
  res.json({ success: true, data: order });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, count: orders.length, data: orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!valid.includes(status)) throw new AppError('Invalid status', 400);

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
});
