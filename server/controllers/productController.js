const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');
const { validateProductBody } = require('../utils/fieldValidation');

exports.getProducts = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };

  const products = await Product.find(filter).sort({ category: 1, name: 1 }).lean();
  res.json({ success: true, count: products.length, data: products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const image = req.file?.path || req.body.image;
  if (!image) throw new AppError('Image is required', 400);

  const validated = validateProductBody(req.body);
  const product = await Product.create({ ...validated, image });
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const validated = validateProductBody(req.body);
  const updates = { ...validated };
  if (req.body.image) updates.image = String(req.body.image).trim();
  if (req.file) updates.image = req.file.path;

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  if (product.image?.includes('cloudinary')) {
    const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }
  res.json({ success: true, message: 'Product deleted' });
});
