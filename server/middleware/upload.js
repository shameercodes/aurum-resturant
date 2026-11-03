const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// ─── Cloudinary storage for menu images ───
const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aurum/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'fill', quality: 'auto:good' }],
  },
});

// ─── Cloudinary storage for user avatars ───
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aurum/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

exports.uploadProductImage = multer({
  storage: menuStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

exports.uploadMenuImage = multer({
  storage: menuStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

exports.uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');
