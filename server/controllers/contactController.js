const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendContactEmail } = require('../config/email');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
exports.createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  const contact = await Contact.create({ name, email, subject, message });

  // Send acknowledgement email (non-blocking)
  sendContactEmail(contact).catch(err =>
    console.error('⚠️  Contact email failed:', err.message)
  );

  res.status(201).json({
    success: true,
    message: 'Message received. We will respond within 24 hours.',
  });
});

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.read === 'true') filter.read = true;
  if (req.query.read === 'false') filter.read = false;
  const messages = await Contact.find(filter).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// @desc    Get single message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getMessageById = asyncHandler(async (req, res) => {
  const msg = await Contact.findById(req.params.id);
  if (!msg) throw new AppError('Message not found', 404);
  res.status(200).json({ success: true, data: msg });
});

// @desc    Mark read/unread
// @route   PATCH /api/contact/:id
// @access  Private/Admin
exports.updateMessageReadStatus = asyncHandler(async (req, res) => {
  if (typeof req.body.read !== 'boolean') throw new AppError('"read" must be a boolean', 400);
  const msg = await Contact.findByIdAndUpdate(req.params.id, { read: req.body.read }, { new: true });
  if (!msg) throw new AppError('Message not found', 404);
  res.status(200).json({ success: true, data: msg });
});

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = asyncHandler(async (req, res) => {
  const msg = await Contact.findByIdAndDelete(req.params.id);
  if (!msg) throw new AppError('Message not found', 404);
  res.status(200).json({ success: true, message: 'Message deleted' });
});
