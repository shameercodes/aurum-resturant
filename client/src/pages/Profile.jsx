import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  preparing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  out_for_delivery: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const TRACKING_STEPS = [
  {
    status: "pending",
    label: "Order Placed",
    description: "We've received your order.",
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "Your food is being prepared.",
  },
  {
    status: "out_for_delivery",
    label: "On the Way",
    description: "Your order is on its way.",
  },
  { status: "delivered", label: "Delivered", description: "Enjoy your meal!" },
];

const getProductId = (product) =>
  product ? String(product._id || product) : "";

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleString();
};

const formatStatus = (status = "") =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      )}
    </div>
  );
}

function OrderTimeline({ order }) {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  if (order.status === "cancelled") {
    const cancellation = [...history]
      .reverse()
      .find((entry) => entry.status === "cancelled");

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-700">Order Cancelled</p>
        <p className="mt-1 text-xs text-red-600">
          {formatDate(cancellation?.changedAt || order.cancelledAt)}
        </p>
        {order.cancellationReason && (
          <p className="mt-3 text-sm text-red-700">
            <strong>Reason:</strong> {order.cancellationReason}
          </p>
        )}
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="font-bold text-gray-900">Order Tracking</h3>
        <span className="text-xs font-medium text-gray-400">
          {currentIndex >= 0
            ? `${currentIndex + 1} of ${TRACKING_STEPS.length} completed`
            : "Status update"}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-4 h-[calc(100%-32px)] w-0.5 bg-gray-200" />
        <div
          className="absolute left-[15px] top-4 w-0.5 bg-emerald-500 transition-all"
          style={{
            height:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / (TRACKING_STEPS.length - 1)) * (100 - 32)}%`,
          }}
        />

        <div className="relative space-y-6">
          {TRACKING_STEPS.map((step, index) => {
            const completed = currentIndex >= index;
            const active = order.status === step.status;
            const historyEntry = history.find(
              (entry) => entry.status === step.status,
            );

            return (
              <div key={step.status} className="flex gap-4">
                <div
                  className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {historyEntry
                      ? formatDate(historyEntry.changedAt)
                      : step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewStatus({ review }) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    hidden: "bg-gray-100 text-gray-600",
    pending: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[review.status] || styles.pending
      }`}
    >
      {formatStatus(review.status)}
    </span>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [cancellingId, setCancellingId] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reviewing, setReviewing] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/api/orders/my");
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyReviews = useCallback(async () => {
    try {
      const response = await api.get("/api/reviews/my-reviews");
      setMyReviews(response.data.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMyReviews();
  }, [fetchOrders, fetchMyReviews]);

  const findReview = (orderId, type, productId = "") =>
    myReviews.find((review) => {
      const sameOrder =
        String(review.order?._id || review.order) === String(orderId);

      if (!sameOrder || review.type !== type) return false;
      if (type === "restaurant") return true;

      return getProductId(review.product) === String(productId);
    });

  const openReviewForm = (orderId, type, productId = "", productName = "") => {
    setReviewing({ orderId, type, productId, productName });
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
  };

const handleSubmitReview = async (e) => {
  e.preventDefault();
  if (!reviewing) return;

  // Validate rating
  if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
    setReviewError("Please select a rating between 1 and 5 stars.");
    return;
  }

  // Validate comment
  if (!reviewComment.trim()) {
    setReviewError("Please write your feedback before submitting.");
    return;
  }

  setReviewSubmitting(true);
  setReviewError("");

  try {
    const payload = {
      orderId: reviewing.orderId,
      type: reviewing.type,
      rating: reviewRating,
      comment: reviewComment.trim(),
    };

    if (reviewing.type === "product") {
      payload.productId = reviewing.productId;
    }

    const response = await api.post("/api/reviews", payload);

    setMyReviews((prev) => [response.data.data, ...prev]);
    setReviewing(null);
    setReviewComment("");
    setReviewRating(5);
    setMessage("Your review was submitted and is awaiting admin approval.");
  } catch (err) {
    setReviewError(
      err.response?.data?.message || "Failed to submit your review."
    );
  } finally {
    setReviewSubmitting(false);
  }
};

  const handleCancelOrder = async (orderId) => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(`/api/orders/${orderId}/cancel`, {
        cancellationReason: reason.trim(),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? response.data.data : order,
        ),
      );

      setCancellingId(null);
      setReason("");
      setMessage("Your order has been cancelled successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel this order.");
    } finally {
      setSubmitting(false);
    }
  };

  const canCancel = (status) => ["pending", "preparing"].includes(status);

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  ).length;

  const activeOrders = orders.filter((order) =>
    ["pending", "preparing", "out_for_delivery"].includes(order.status),
  ).length;

  const initials = (user?.name || "Customer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-4 py-8 text-gray-900 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* PAGE INTRO */}
        <div className="mb-8 border-b border-gray-200 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Aurum Restaurant
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                My Account
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage your profile and keep track of your orders.
              </p>
            </div>
            <span className="text-sm text-gray-500">
              Welcome,{" "}
              <strong className="text-gray-900">
                {user?.name || "Customer"}
              </strong>
            </span>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {location.state?.orderSuccess && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            ✓ Order placed successfully! Confirmation email sent.
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PROFILE AND STATS */}
        <div className="mb-10 grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xl font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Account Details
                </p>
                <h2 className="mt-1 break-words text-lg font-bold">
                  {user?.name || "Customer"}
                </h2>
                <p className="mt-1 break-all text-sm text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Membership
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                Aurum Eats Customer
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Total Orders",
                value: orders.length,
                detail: "Orders placed",
              },
              {
                label: "Delivered",
                value: deliveredOrders,
                detail: "Successfully completed",
              },
              {
                label: "Active Orders",
                value: activeOrders,
                detail: "Currently processing",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col justify-center rounded-2xl border border-gray-200 bg-white p-5"
              >
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-gray-400">{stat.detail}</p>
              </div>
            ))}
          </section>
        </div>

        {/* ORDER HISTORY */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Your Activity"
            title="Order History"
            description="View your orders, follow delivery progress and share feedback."
          />
          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16">
            <LoadingSpinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="text-4xl">🍽️</div>
            <h3 className="mt-4 text-xl font-bold">No orders yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your orders will appear here after you place your first order.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  {/* ORDER SUMMARY */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Order Reference
                        </p>
                        <h3 className="mt-1 font-mono text-lg font-bold text-gray-950">
                          #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                          STATUS_COLORS[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-400">Order Total</p>
                        <p className="mt-1 text-lg font-bold text-gray-950">
                          £{Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Items</p>
                        <p className="mt-1 text-lg font-bold text-gray-950">
                          {order.items?.length || 0}
                        </p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-400">Payment</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatStatus(order.paymentMethod || "Not specified")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order._id)
                      }
                      className="mt-6 flex w-full items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-700 transition hover:text-amber-600"
                    >
                      {isExpanded ? "Hide Order Details" : "View Order Details"}
                      <span className="text-lg">{isExpanded ? "−" : "+"}</span>
                    </button>
                  </div>

                  {/* EXPANDED ORDER DETAILS */}
                  {isExpanded && (
                    <div className="space-y-6 border-t border-gray-100 bg-[#fafaf9] p-5 sm:p-6">
                      {/* ORDER ITEMS */}
                      <section>
                        <h3 className="mb-4 font-bold text-gray-900">
                          Items in Your Order
                        </h3>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div
                              key={`${getProductId(item.product) || item.name}-${index}`}
                              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3"
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                                  🍽️
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                £
                                {(
                                  Number(item.price || 0) *
                                  Number(item.quantity || 0)
                                ).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* TRACKING */}
                      <section>
                        <OrderTimeline order={order} />
                      </section>

                      {/* REVIEWS */}
                      {order.status === "delivered" && (
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                          <div className="mb-5">
                            <h3 className="font-bold text-gray-900">
                              Share Your Experience
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              Your feedback helps us improve.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                            <div>
                              <p className="text-sm font-semibold">
                                Restaurant Experience
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Rate your overall experience.
                              </p>
                            </div>
                            {findReview(order._id, "restaurant") ? (
                              <ReviewStatus
                                review={findReview(order._id, "restaurant")}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewForm(order._id, "restaurant")
                                }
                                className="rounded-lg bg-[#171717] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                              >
                                Write Review
                              </button>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="mb-3 text-sm font-semibold">
                              Food & Products
                            </p>
                            <div className="space-y-2">
                              {order.items?.map((item, index) => {
                                const productId = getProductId(item.product);
                                const existingReview = productId
                                  ? findReview(order._id, "product", productId)
                                  : null;

                                return (
                                  <div
                                    key={`${productId || item.name}-${index}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                                  >
                                    <p className="text-sm font-medium">
                                      {item.name}
                                    </p>
                                    {existingReview ? (
                                      <ReviewStatus review={existingReview} />
                                    ) : productId ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openReviewForm(
                                            order._id,
                                            "product",
                                            productId,
                                            item.name,
                                          )
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
                                      >
                                        Rate Product
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {reviewing?.orderId === order._id && (
                            <form
                              onSubmit={handleSubmitReview}
                              className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
                            >
                              <h4 className="font-bold">
                                {reviewing.type === "restaurant"
                                  ? "Review Restaurant"
                                  : `Review ${reviewing.productName}`}
                              </h4>
                              <p className="mt-1 text-xs text-gray-500">
                                Your review will be checked before appearing
                                publicly.
                              </p>

                              <label className="mt-5 block text-sm font-semibold">
                                Your Rating
                              </label>
                              <div className="mt-2 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    aria-label={`Rate ${star} stars`}
                                    className={`text-3xl ${
                                      star <= reviewRating
                                        ? "text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                                <span className="ml-2 text-sm font-semibold">
                                  {reviewRating}/5
                                </span>
                              </div>

                              <label className="mt-5 block text-sm font-semibold">
                                Your Comment (optional)
                              </label>
                              <textarea
                                required
                                value={reviewComment}
                                onChange={(e) => {
                                  setReviewComment(e.target.value);
                                  if (reviewError) setReviewError("");
                                }}
                                maxLength={1000}
                                rows={4}
                                placeholder="Tell us about your experience..."
                                className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                              />
                              <p className="mt-1 text-right text-xs text-gray-400">
                                {reviewComment.length}/1000
                              </p>

                              {reviewError && (
                                <p className="mt-3 text-sm text-red-600">
                                  {reviewError}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  type="submit"
                                  disabled={reviewSubmitting}
                                  className="rounded-lg bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                                >
                                  {reviewSubmitting
                                    ? "Submitting..."
                                    : "Submit Review"}
                                </button>
                                <button
                                  type="button"
                                  disabled={reviewSubmitting}
                                  onClick={() => {
                                    setReviewing(null);
                                    setReviewError("");
                                  }}
                                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </section>
                      )}

                      {/* CANCELLATION */}
                      {canCancel(order.status) && (
                        <section className="border-t border-gray-200 pt-5">
                          {cancellingId === order._id ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                              <h4 className="font-bold text-red-700">
                                Cancel This Order?
                              </h4>
                              <p className="mt-1 text-xs text-red-600">
                                You may provide a reason for cancellation.
                              </p>
                              <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                maxLength={300}
                                rows={3}
                                placeholder="Reason for cancellation..."
                                className="mt-4 w-full rounded-lg border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400"
                              />
                              <div className="mt-3 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {submitting
                                    ? "Cancelling..."
                                    : "Confirm Cancellation"}
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => {
                                    setCancellingId(null);
                                    setReason("");
                                    setError("");
                                  }}
                                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
                                >
                                  Keep Order
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingId(order._id);
                                setReason("");
                                setError("");
                                setMessage("");
                              }}
                              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Cancel Order
                            </button>
                          )}
                        </section>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
