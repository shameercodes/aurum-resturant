const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    ordersToday,
    pendingOrders,
    recentOrders,
    statusCounts,
    lowStockProducts,
    topProducts,
    categoryBreakdown,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ status: 'pending' }),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.find({ stock: { $lte: 10 }, isActive: true })
      .sort({ stock: 1 })
      .limit(8)
      .lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      ordersToday,
      pendingOrders,
      statusCounts,
      recentOrders,
      lowStockProducts,
      topProducts,
      categoryBreakdown,
    },
  });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.lowStock === 'true') filter.stock = { $lte: 10 };

  const products = await Product.find(filter).sort({ category: 1, name: 1 }).lean();
  res.json({ success: true, count: products.length, data: products });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  let orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    orders = orders.filter(
      o =>
        o._id.toString().toLowerCase().includes(s) ||
        o.user?.name?.toLowerCase().includes(s) ||
        o.user?.email?.toLowerCase().includes(s) ||
        o.address?.phone?.includes(s)
    );
  }

  res.json({ success: true, count: orders.length, data: orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name category')
    .lean();
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role && req.query.role !== 'all') filter.role = req.query.role;
  if (req.query.verified === 'true') filter.isVerified = true;
  if (req.query.verified === 'false') filter.isVerified = false;

  let users = await User.find(filter).select('-password -otp -otpExpiry').sort({ createdAt: -1 }).lean();

  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    users = users.filter(
      u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: users.length, data: users });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isVerified } = req.body;
  const updates = {};
  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) throw new AppError('Invalid role', 400);
    updates.role = role;
  }
  if (isVerified !== undefined) updates.isVerified = Boolean(isVerified);

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString() && role === 'user') {
    throw new AppError('Cannot demote your own admin account', 400);
  }
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('Cannot delete your own account', 400);
  }
  if (user.role === 'admin') throw new AppError('Cannot delete admin users', 400);
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});
