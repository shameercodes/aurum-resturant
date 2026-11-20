import { useCallback, useEffect, useState } from "react";
import {
  FiGrid,
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";

import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

const EMPTY_FORM = {
  tableNumber: "",
  capacity: "2",
  location: "indoor",
  status: "available",
  description: "",
};

const LOCATIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "window", label: "Window" },
  { value: "private", label: "Private" },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>

        <span className={`rounded-xl p-3 ${color}`}>
          <Icon className="text-xl" />
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const available = status === "available";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        available
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {available ? "Available" : "Unavailable"}
    </span>
  );
}

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
  };

  const loadTables = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/api/admin/tables");
      setTables(data.data || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Failed to load restaurant tables",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingTable(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingTable(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (table) => {
    setEditingTable(table);

    setForm({
      tableNumber: table.tableNumber || "",
      capacity: String(table.capacity || 2),
      location: table.location || "indoor",
      status: table.status || "available",
      description: table.description || "",
    });

    setErrors({});
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.tableNumber.trim()) {
      newErrors.tableNumber = "Table number is required";
    }

    const capacity = Number(form.capacity);

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
      newErrors.capacity = "Capacity must be between 1 and 20";
    }

    if (!LOCATIONS.some((item) => item.value === form.location)) {
      newErrors.location = "Please select a valid location";
    }

    if (!["available", "unavailable"].includes(form.status)) {
      newErrors.status = "Please select a valid status";
    }

    if (form.description.length > 200) {
      newErrors.description = "Maximum 200 characters allowed";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      tableNumber: form.tableNumber.trim(),
      capacity: Number(form.capacity),
      location: form.location,
      status: form.status,
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      if (editingTable) {
        await api.patch(`/api/admin/tables/${editingTable._id}`, payload);

        showMessage("Table updated successfully");
      } else {
        await api.post("/api/admin/tables", payload);

        showMessage("New restaurant table created successfully");
      }

      resetForm();
      await loadTables();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Unable to save table",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (table) => {
    const nextStatus =
      table.status === "available" ? "unavailable" : "available";

    try {
      await api.patch(`/api/admin/tables/${table._id}`, {
        status: nextStatus,
      });

      showMessage(`Table marked ${nextStatus}`);
      await loadTables();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Unable to update table status",
        "error",
      );
    }
  };

  const handleDelete = async (table) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete table ${table.tableNumber}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/tables/${table._id}`);

      showMessage("Table deleted successfully");
      await loadTables();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Unable to delete this table",
        "error",
      );
    }
  };

  const filteredTables = tables.filter((table) => {
    const searchMatch =
      table.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
      table.location?.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter === "all" || table.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const totalTables = tables.length;
  const availableTables = tables.filter(
    (table) => table.status === "available",
  ).length;
  const unavailableTables = tables.filter(
    (table) => table.status === "unavailable",
  ).length;

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {/* Notification */}
      {message && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          <span className="flex items-center gap-2">
            {message.type === "error" ? <FiAlertTriangle /> : <FiCheckCircle />}
            {message.text}
          </span>

          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="Dismiss notification"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Table Management
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant seating, capacity and table availability.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadTables}
            disabled={loading}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            <FiPlus />
            Add table
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FiGrid}
          label="Total tables"
          value={totalTables}
          color="bg-brand-50 text-brand-600 dark:bg-brand-500/15"
        />

        <StatCard
          icon={FiCheck}
          label="Available tables"
          value={availableTables}
          color="bg-green-50 text-green-600 dark:bg-green-500/15"
        />

        <StatCard
          icon={FiAlertTriangle}
          label="Unavailable tables"
          value={unavailableTables}
          color="bg-red-50 text-red-600 dark:bg-red-500/15"
        />
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTable
                  ? "Edit restaurant table"
                  : "Add restaurant table"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Complete the details below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close form"
            >
              <FiX />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Table Number */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Table number *
              </label>

              <input
                type="text"
                maxLength={30}
                placeholder="e.g. T-01"
                className="input-field"
                value={form.tableNumber}
                onChange={(e) =>
                  setForm({ ...form, tableNumber: e.target.value })
                }
              />

              {errors.tableNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tableNumber}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Seating capacity *
              </label>

              <input
                type="number"
                min="1"
                max="20"
                step="1"
                className="input-field"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />

              {errors.capacity && (
                <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Table location *
              </label>

              <select
                className="input-field"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                {LOCATIONS.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>

              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Availability
              </label>

              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>

              {errors.status && (
                <p className="mt-1 text-xs text-red-500">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={3}
              maxLength={200}
              className="input-field"
              placeholder="Optional table description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <span />
              )}

              <span className="text-xs text-gray-500">
                {form.description.length}/200
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary !px-6"
            >
              {saving ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck />
                  {editingTable ? "Save changes" : "Create table"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="btn-secondary !px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="input-field min-w-[200px] flex-1"
          placeholder="Search table number or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="input-field w-auto min-w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <span className="text-sm text-gray-500">
          {filteredTables.length} tables
        </span>
      </div>

      {/* Tables List */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Restaurant tables
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              All registered seating areas
            </p>
          </div>

          <FiGrid className="text-xl text-gray-400" />
        </div>

        {loading ? (
          <div className="p-10">
            <LoadingSpinner />
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FiGrid className="mx-auto text-4xl text-gray-400" />

            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
              {tables.length === 0
                ? "No tables created yet"
                : "No matching tables found"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {tables.length === 0
                ? "Create your first restaurant table to start accepting reservations."
                : "Try changing your search or status filter."}
            </p>

            {tables.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="btn-primary mt-5"
              >
                <FiPlus />
                Create first table
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                <tr>
                  <th className="p-4">Table</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-right pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTables.map((table) => (
                  <tr
                    key={table._id}
                    className="border-t border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {table.tableNumber}
                      </p>

                      {table.description && (
                        <p className="mt-1 max-w-xs text-xs text-gray-500">
                          {table.description}
                        </p>
                      )}
                    </td>

                    <td>
                      <span className="inline-flex items-center gap-2">
                        <FiUsers className="text-gray-400" />
                        {table.capacity} seats
                      </span>
                    </td>

                    <td>
                      <span className="inline-flex items-center gap-2 capitalize">
                        <FiMapPin className="text-gray-400" />
                        {table.location}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={table.status} />
                    </td>

                    <td className="pr-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(table)}
                          title="Edit table"
                          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStatus(table)}
                          title={
                            table.status === "available"
                              ? "Mark unavailable"
                              : "Mark available"
                          }
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <FiRefreshCw />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(table)}
                          title="Delete table"
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer information */}
      <p className="text-xs text-gray-500">
        Tables with reservation history cannot be deleted. You can mark them
        unavailable instead.
      </p>
    </div>
  );
}
