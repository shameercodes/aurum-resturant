const mongoose = require("mongoose");

const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const VALID_TYPES = ["restaurant", "product"];
const VALID_STATUSES = ["pending", "approved", "rejected", "hidden"];

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const validateRating = (rating) => {
  const value = Number(rating);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError("Rating must be a whole number between 1 and 5", 400);
  }

  return value;
};

const validateComment = (comment) => {
  if (typeof comment !== "string" || !comment.trim()) {
    throw new AppError("Review comment is required", 400);
  }

  const value = comment.trim();

  if (value.length > 1000) {
    throw new AppError("Comment cannot exceed 1000 characters", 400);
  }

  return value;
};

// CREATE CUSTOMER REVIEW
exports.createReview = asyncHandler(async (req, res) => {
  const { orderId, type, productId, rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError("Invalid order ID", 400);
  }

  if (!VALID_TYPES.includes(type)) {
    throw new AppError("Invalid review type", 400);
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    status: "delivered",
  });

  if (!order) {
    throw new AppError("Only your delivered orders can be reviewed", 403);
  }

  let selectedProduct = null;

  if (type === "product") {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Valid product ID is required", 400);
    }

    const purchasedItem = order.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!purchasedItem) {
      throw new AppError(
        "You can only review products purchased in this order",
        403,
      );
    }

    selectedProduct = productId;
  } else if (productId) {
    throw new AppError("Restaurant reviews cannot contain a product ID", 400);
  }

  const existingFilter = {
    user: req.user._id,
    order: order._id,
    type,
  };

  if (type === "product") {
    existingFilter.product = selectedProduct;
  }

  const existingReview = await Review.findOne(existingFilter);

  if (existingReview) {
    throw new AppError("You have already reviewed this order item", 409);
  }

  const review = await Review.create({
    user: req.user._id,
    order: order._id,
    type,
    product: selectedProduct,
    rating: validateRating(rating),
    comment: validateComment(comment),
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully. Waiting for admin approval.",
    data: review,
  });
});

// GET PUBLIC APPROVED REVIEWS
exports.getPublicReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { type, productId, rating } = req.query;

  const filter = { status: "approved" };

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new AppError("Invalid review type", 400);
    }

    filter.type = type;
  }

  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    filter.type = "product";
    filter.product = productId;
  }

  if (rating !== undefined) {
    filter.rating = validateRating(rating);
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .populate("product", "name image")
      .select("-adminReply.repliedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});

// GET PUBLIC RATING SUMMARY
exports.getReviewSummary = asyncHandler(async (req, res) => {
  const { type, productId } = req.query;

  const filter = { status: "approved" };

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new AppError("Invalid review type", 400);
    }

    filter.type = type;
  }

  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    filter.type = "product";
    filter.product = new mongoose.Types.ObjectId(productId);
  }

  const results = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
        totalRating: { $sum: "$rating" },
      },
    },
  ]);

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let totalReviews = 0;
  let totalRating = 0;

  results.forEach((item) => {
    distribution[item._id] = item.count;
    totalReviews += item.count;
    totalRating += item.totalRating;
  });

  res.json({
    success: true,
    data: {
      averageRating: totalReviews
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0,
      totalReviews,
      distribution,
    },
  });
});

// GET LOGGED-IN CUSTOMER REVIEWS
exports.getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { user: req.user._id };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("order", "status createdAt")
      .populate("product", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});

// UPDATE OWN REVIEW
exports.updateMyReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (rating === undefined && comment === undefined) {
    throw new AppError("Provide a rating or comment to update", 400);
  }

  if (rating !== undefined) {
    review.rating = validateRating(rating);
  }

  if (comment !== undefined) {
    review.comment = validateComment(comment);
  }

  // Edited reviews require admin approval again.
  review.status = "pending";

  review.adminReply = {
    message: "",
    repliedAt: null,
    repliedBy: null,
  };

  await review.save();

  res.json({
    success: true,
    message: "Review updated and submitted for approval",
    data: review,
  });
});

// DELETE OWN REVIEW
exports.deleteMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});

// GET ALL REVIEWS (ADMIN)
exports.getAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, type, rating } = req.query;

  const filter = {};

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError("Invalid review status", 400);
    }

    filter.status = status;
  }

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new AppError("Invalid review type", 400);
    }

    filter.type = type;
  }

  if (rating !== undefined) {
    filter.rating = validateRating(rating);
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email")
      .populate("order", "status createdAt totalAmount")
      .populate("product", "name image")
      .populate("adminReply.repliedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});

// UPDATE REVIEW STATUS (ADMIN)
exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError("Invalid review status", 400);
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  review.status = status;

  await review.save();

  res.json({
    success: true,
    message: `Review ${status} successfully`,
    data: review,
  });
});

// CREATE OR UPDATE ADMIN REPLY
exports.replyToReview = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    throw new AppError("Reply message is required", 400);
  }

  if (message.trim().length > 1000) {
    throw new AppError("Reply cannot exceed 1000 characters", 400);
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.status !== "approved") {
    throw new AppError("Only approved reviews can receive public replies", 400);
  }

  review.adminReply = {
    message: message.trim(),
    repliedAt: new Date(),
    repliedBy: req.user._id,
  };

  await review.save();

  res.json({
    success: true,
    message: "Admin reply saved successfully",
    data: review,
  });
});

// DELETE ADMIN REPLY
exports.deleteAdminReply = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  review.adminReply = {
    message: "",
    repliedAt: null,
    repliedBy: null,
  };

  await review.save();

  res.json({
    success: true,
    message: "Admin reply deleted successfully",
    data: review,
  });
});

// DELETE REVIEW (ADMIN)
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});
