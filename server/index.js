require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const corsOptions = require('./config/corsOptions');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const seedProducts = require('./utils/seedProducts');
const seedAdmin = require('./utils/seedAdmin');
const { verifyEmailConfig } = require('./config/email');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB().then(async () => {
  await seedProducts();
  await seedAdmin();
});
connectCloudinary();

verifyEmailConfig()
  .then((ready) => {
    console.log(`📧 Email configuration: ${ready ? "READY" : "NOT READY"}`);
  })
  .catch((err) => {
    console.error("❌ Email verification error:", err.message);
  });

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
app.use('/api/', generalLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    app: process.env.APP_NAME || 'Aurum Eats',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 ${process.env.APP_NAME || "Aurum Eats"} API running on port ${PORT}`,
  );
  console.log(
    `📧 Admin: ${process.env.ADMIN_EMAIL || "admin@aurumrestaurant.co.uk"}`,
  );
});

const shutdown = signal => {
  console.log(`\n${signal} — shutting down`);
  server.close(() => mongoose.connection.close(false, () => process.exit(0)));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});
