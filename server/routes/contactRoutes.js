const express = require('express');
const router = express.Router();
const { createMessage, getAllMessages, getMessageById, updateMessageReadStatus, deleteMessage } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .post(writeLimiter, createMessage)
  .get(protect, authorize('admin'), getAllMessages);

router.route('/:id')
  .get(protect, authorize('admin'), validateObjectId, getMessageById)
  .patch(protect, authorize('admin'), validateObjectId, updateMessageReadStatus)
  .delete(protect, authorize('admin'), validateObjectId, deleteMessage);

module.exports = router;
