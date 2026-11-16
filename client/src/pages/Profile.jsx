import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const TRACKING_STEPS = [
  { status: "pending", label: "Order Placed" },
  { status: "preparing", label: "Preparing" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];


function OrderTimeline({ order }) {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Date unavailable"
      : parsed.toLocaleString();
  };

  if (order.status === "cancelled") {
    const cancellation = [...history]
      .reverse()
      .find((entry) => entry.status === "cancelled");

    return (
      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="font-semibold text-red-700 dark:text-red-300">
          Order Cancelled
        </p>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {formatDate(cancellation?.changedAt || order.cancelledAt)}
        </p>

        {order.cancellationReason && (
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Reason: {order.cancellationReason}
          </p>
        )}
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <div className="mt-5">
      <h3 className="mb-4 font-semibold">Order Tracking</h3>

      <div className="space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const completed = currentIndex >= index;

          const historyEntry = history.find(
            (entry) => entry.status === step.status,
          );

          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {index !== TRACKING_STEPS.length - 1 && (
                  <div
                    className={`min-h-10 w-0.5 ${
                      currentIndex > index
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>

              <div className="pb-6">
                <p className="text-sm font-semibold">
                  {step.label}
                  {order.status === step.status && (
                    <span className="ml-2 text-xs text-brand-600">Current</span>
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {historyEntry
                    ? formatDate(historyEntry.changedAt)
                    : completed
                      ? "Date unavailable"
                      : "Waiting for update"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      {location.state?.orderSuccess && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Order placed successfully! Confirmation email sent.
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="card mt-6 p-6">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      <h2 className="mt-10 text-xl font-bold">Order history</h2>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <p className="mt-4 text-gray-500">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm">
                  #{o._id.slice(-6).toUpperCase()}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] || ""}`}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(o.createdAt).toLocaleString()}
              </p>

              <p className="mt-1 font-bold text-brand-600">
                £{Number(o.totalAmount).toFixed(2)} · {o.items?.length} items
              </p>
              <OrderTimeline order={o} />


              {canCancel(o.status) && (
                <div className="mt-4">
                  {cancellingId === o._id ? (
                    <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <label className="block text-sm font-medium">
                        Reason for cancellation (optional)
                      </label>

                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={300}
                        rows={3}
                        placeholder="Why do you want to cancel this order?"
                        className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600"
                      />

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleCancelOrder(o._id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          Keep Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingId(o._id);
                        setReason("");
                        setError("");
                        setMessage("");
                      }}
                      className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
