const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');

const VALID_CATEGORIES = ['starters', 'mains', 'desserts', 'cocktails'];

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getAllMenuItems = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) {
    if (!VALID_CATEGORIES.includes(req.query.category))
      throw new AppError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
    filter.category = req.query.category;
  }
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.isVegetarian === 'true') filter.isVegetarian = true;

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 }).lean();
  res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).lean();
  if (!item) throw new AppError('Menu item not found', 404);
  res.status(200).json({ success: true, data: item });
});

// @desc    Create menu item (with Cloudinary image upload)
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = asyncHandler(async (req, res) => {
  const { name, category, price, description, badges, spiceLevel, isVegetarian, featured } = req.body;
  const imageUrl = req.file ? req.file.path : req.body.image;
  if (!imageUrl) throw new AppError('Image is required', 400);

  const item = await MenuItem.create({
    name, category, price: Number(price), description,
    image: imageUrl,
    badges: badges ? (Array.isArray(badges) ? badges : badges.split(',').map(b => b.trim())) : [],
    spiceLevel: Number(spiceLevel) || 0,
    isVegetarian: isVegetarian === 'true' || isVegetarian === true,
    featured: featured === 'true' || featured === true,
  });
  res.status(201).json({ success: true, data: item });
});

// @desc    Update menu item
// @route   PATCH /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = asyncHandler(async (req, res) => {
  const allowed = ['name', 'category', 'price', 'description', 'badges', 'spiceLevel', 'isVegetarian', 'featured', 'image'];
  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] === undefined) return;
    if (key === 'price') updates.price = Number(req.body.price);
    else if (key === 'spiceLevel') updates.spiceLevel = Number(req.body.spiceLevel) || 0;
    else if (key === 'badges') {
      updates.badges = Array.isArray(req.body.badges)
        ? req.body.badges
        : String(req.body.badges).split(',').map(b => b.trim()).filter(Boolean);
    } else if (key === 'isVegetarian' || key === 'featured') {
      updates[key] = req.body[key] === 'true' || req.body[key] === true;
    } else updates[key] = req.body[key];
  });
  if (req.file) updates.image = req.file.path;

  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!item) throw new AppError('Menu item not found', 404);
  res.status(200).json({ success: true, data: item });
});

// @desc    Delete menu item (also removes Cloudinary image)
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError('Menu item not found', 404);

  // Remove image from Cloudinary if it's stored there
  if (item.image && item.image.includes('cloudinary')) {
    const publicId = item.image.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  await item.deleteOne();
  res.status(200).json({ success: true, message: 'Menu item deleted' });
});
