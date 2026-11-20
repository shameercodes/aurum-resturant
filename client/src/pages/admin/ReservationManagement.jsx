import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiCheck,
  FiX,
  FiTrash2,
  FiUsers,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../api/axios";

const STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
  "seated",
  "completed",
];

const statusStyles = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  seated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  completed:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="card flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <span className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/15">
        <Icon className="text-xl" />
      </span>
    </div>
  );
}

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/reservations");
      setReservations(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const updateStatus = async (id, status) => {
    const messages = {
      confirmed: "Confirm this reservation?",
      rejected: "Reject this reservation?",
      seated: "Mark this reservation as seated?",
      completed: "Mark this reservation as completed?",
      cancelled: "Cancel this reservation?",
    };

    if (!window.confirm(messages[status] || "Update this reservation?")) {
      return;
    }

    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await api.patch(`/api/reservations/${id}`, { status });
      setNotice(`Reservation ${status} successfully.`);
      await loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update reservation.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm("Permanently delete this reservation?")) return;

    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await api.delete(`/api/reservations/${id}`);
      setReservations((current) =>
        current.filter((reservation) => reservation._id !== id),
      );
      setNotice("Reservation deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete reservation.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const name =
        `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim();

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        (reservation.email || "").toLowerCase().includes(query) ||
        (reservation.phone || "").toLowerCase().includes(query) ||
        (reservation.table?.tableNumber || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      const matchesDate = !dateFilter || reservation.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, search, statusFilter, dateFilter]);

  const counts = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      rejected: reservations.filter((r) => r.status === "rejected").length,
    }),
    [reservations],
  );

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reservation Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review bookings and manage customer reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReservations}
          disabled={loading}
          className="btn-secondary !px-4 !py-2 text-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          <FiCheck />
          {notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total reservations"
          value={counts.total}
          icon={FiCalendar}
        />
        <Stat label="Pending approval" value={counts.pending} icon={FiClock} />
        <Stat label="Confirmed" value={counts.confirmed} icon={FiCheck} />
        <Stat label="Rejected" value={counts.rejected} icon={FiX} />
      </div>

      <div className="card space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field !pl-10"
              placeholder="Search name, email, phone, table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>
            Showing {filteredReservations.length} of {reservations.length}{" "}
            reservations
          </span>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("");
            }}
            className="font-medium text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <FiRefreshCw className="mx-auto mb-3 animate-spin text-2xl" />
            Loading reservations...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar className="mx-auto mb-3 text-3xl text-gray-400" />
            <p className="font-medium text-gray-700 dark:text-gray-200">
              No reservations found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Reservations will appear here when customers make bookings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredReservations.map((reservation) => {
              const name =
                `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim() ||
                "Customer";

              const busy = updatingId === reservation._id;

              return (
                <article key={reservation._id} className="p-5">
                  <div className="flex flex-col justify-between gap-4 xl:flex-row">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyles[reservation.status] ||
                            statusStyles.pending
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
                        <p>
                          <span className="text-gray-400">Email:</span>{" "}
                          {reservation.email || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Phone:</span>{" "}
                          {reservation.phone || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Date:</span>{" "}
                          {formatDate(reservation.date)}
                        </p>
                        <p>
                          <span className="text-gray-400">Time:</span>{" "}
                          {reservation.time || "—"}
                        </p>
                        <p className="flex items-center gap-1">
                          <FiUsers className="text-gray-400" />
                          {reservation.guests} guests
                        </p>
                        <p>
                          <span className="text-gray-400">Table:</span>{" "}
                          {reservation.table?.tableNumber || "—"}
                          {reservation.table?.location
                            ? ` (${reservation.table.location})`
                            : ""}
                        </p>
                        <p>
                          <span className="text-gray-400">Occasion:</span>{" "}
                          {reservation.occasion || "—"}
                        </p>
                      </div>

                      {reservation.specialRequests && (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
                          <span className="font-medium">Special requests:</span>{" "}
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-start gap-2 xl:max-w-[230px] xl:justify-end">
                      {reservation.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateStatus(reservation._id, "confirmed")
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <FiCheck /> Confirm
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateStatus(reservation._id, "rejected")
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <FiX /> Reject
                          </button>
                        </>
                      )}

                      {reservation.status === "confirmed" && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateStatus(reservation._id, "seated")
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Mark seated
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateStatus(reservation._id, "cancelled")
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {reservation.status === "seated" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateStatus(reservation._id, "completed")
                          }
                          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        type="button"
                        title="Delete reservation"
                        disabled={busy}
                        onClick={() => deleteReservation(reservation._id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 disabled:opacity-50"
                      >
                        <FiTrash2 />
                      </button>

                      {busy && (
                        <span className="w-full text-xs text-gray-500 xl:text-right">
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
