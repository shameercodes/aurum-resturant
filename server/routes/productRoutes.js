const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { uploadProductImage } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', validateObjectId, getProduct);

router.post('/', protect, authorize('admin'), uploadProductImage, createProduct);
router.patch('/:id', protect, authorize('admin'), validateObjectId, uploadProductImage, updateProduct);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteProduct);

module.exports = router;
