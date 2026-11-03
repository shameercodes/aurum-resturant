const express = require('express');
const router = express.Router();
const { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { uploadMenuImage } = require('../middleware/upload');

router.route('/')
  .get(getAllMenuItems)
  .post(protect, authorize('admin'), uploadMenuImage, createMenuItem);

router.route('/:id')
  .get(validateObjectId, getMenuItemById)
  .patch(protect, authorize('admin'), validateObjectId, uploadMenuImage, updateMenuItem)
  .delete(protect, authorize('admin'), validateObjectId, deleteMenuItem);

module.exports = router;
