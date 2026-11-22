const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const {
  createReview,
  getPublicReviews,
  getReviewSummary,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getAdminReviews,
  updateReviewStatus,
  replyToReview,
  deleteAdminReply,
  deleteReview,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/auth");
const AppError = require("../utils/AppError");

// Validate review ID parameters.
const validateReviewId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid review ID", 400));
  }

  next();
};

// PUBLIC ROUTES
router.get("/", getPublicReviews);
router.get("/summary", getReviewSummary);

// CUSTOMER ROUTES
router.post("/", protect, createReview);

router.get("/my-reviews", protect, getMyReviews);

router.patch("/:id", protect, validateReviewId, updateMyReview);

router.delete("/:id", protect, validateReviewId, deleteMyReview);

// ADMIN ROUTES
router.use("/admin", protect, authorize("admin"));

router.get("/admin", getAdminReviews);

router.patch("/admin/:id/status", validateReviewId, updateReviewStatus);

router.post("/admin/:id/reply", validateReviewId, replyToReview);

router.patch("/admin/:id/reply", validateReviewId, replyToReview);

router.delete("/admin/:id/reply", validateReviewId, deleteAdminReply);

router.delete("/admin/:id", validateReviewId, deleteReview);

module.exports = router;
