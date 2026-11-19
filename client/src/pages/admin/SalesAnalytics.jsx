import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import api from "../../api/axios";

// Currency formatter
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Date formatter
const formatDate = (item) =>
  `${item._id.day}/${item._id.month}/${item._id.year}`;

const SalesAnalytics = () => {
  const [period, setPeriod] = useState("monthly");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch sales analytics
  const fetchAnalytics = async (custom = false) => {
    try {
      if (custom && (!startDate || !endDate)) {
        setError("Please select both start and end dates.");
        return;
      }

      if (custom && startDate > endDate) {
        setError("Start date cannot be after end date.");
        return;
      }

      setLoading(true);
      setError("");

      const params = custom ? { startDate, endDate } : { period };

      const response = await api.get("/api/admin/sales-analytics", {
        params,
      });

      setAnalytics(response.data.data);
    } catch (err) {
      setError(err.displayMessage || "Unable to load sales analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // Export CSV
  const exportCSV = () => {
    if (!analytics) return;

    const rows = [
      ["Date", "Revenue", "Orders"],
      ...(analytics.revenueTrend || []).map((item) => [
        formatDate(item),
        item.revenue,
        item.orders,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "aurum-sales-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const summary = analytics?.summary || {};
  const products = analytics?.topProducts || [];
  const trend = analytics?.revenueTrend || [];

  // Metric cards
  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: FiDollarSign,
      description: "Revenue generated",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders || 0,
      icon: FiShoppingBag,
      description: "Orders received",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(summary.averageOrderValue),
      icon: FiActivity,
      description: "Average revenue per order",
    },
    {
      title: "Revenue Change",
      value:
        analytics?.revenueChange == null
          ? "N/A"
          : `${analytics.revenueChange.toFixed(1)}%`,
      icon: FiTrendingUp,
      description: "Compared with previous period",
      positive: analytics?.revenueChange >= 0,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-3">
            <FiBarChart2 className="text-2xl text-[#FF9F00]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Sales Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track revenue, orders and business performance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchAnalytics()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            disabled={!analytics || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF9F00] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E68F00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-red-700">{error}</p>

          <button
            onClick={() => fetchAnalytics()}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* PERIOD FILTERS */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="font-semibold text-gray-900">Performance Overview</h2>
          <p className="mt-1 text-xs text-gray-500">
            Select a period to view your sales performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["daily", "weekly", "monthly"].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition ${
                period === item
                  ? "bg-[#FF9F00] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOM DATE RANGE */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiCalendar className="text-[#FF9F00]" />

          <h3 className="font-semibold text-gray-900">Custom Date Range</h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#FF9F00] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#FF9F00] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={loading}
            className="rounded-lg bg-[#FF9F00] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E68F00] disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && !analytics ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FiRefreshCw className="mx-auto animate-spin text-2xl text-[#FF9F00]" />

          <p className="mt-3 text-sm text-gray-500">
            Loading sales analytics...
          </p>
        </div>
      ) : (
        <>
          {/* METRIC CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {metric.title}
                      </p>

                      <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
                        {metric.value}
                      </h3>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-3">
                      <Icon className="text-xl text-[#FF9F00]" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    {metric.description}
                  </p>

                  {metric.title === "Revenue Change" &&
                    metric.value !== "N/A" && (
                      <p
                        className={`mt-2 text-xs font-semibold ${
                          metric.positive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {metric.positive
                          ? "Positive growth"
                          : "Below previous period"}
                      </p>
                    )}
                </div>
              );
            })}
          </div>

          {/* REVENUE TREND */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>

              <p className="mt-1 text-sm text-gray-500">
                Revenue generated over the selected period.
              </p>
            </div>

            <div className="h-80">
              {trend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trend}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FF9F00"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="95%"
                          stopColor="#FF9F00"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#E5E7EB"
                    />

                    <XAxis
                      dataKey="_id.day"
                      tickFormatter={(day, index) => {
                        const item = trend[index];

                        return item ? `${item._id.day}/${item._id.month}` : day;
                      }}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tickFormatter={(value) => `Rs ${value}`}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF9F00"
                      fill="url(#revenueFill)"
                      strokeWidth={3}
                      activeDot={{
                        r: 6,
                        strokeWidth: 0,
                        fill: "#FF9F00",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No revenue data available for this period.
                </div>
              )}
            </div>
          </div>

          {/* TOP SELLING PRODUCTS */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Top Selling Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Products ranked by revenue generated.
              </p>
            </div>

            <div className="h-80">
              {products.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={products}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      horizontal={false}
                      stroke="#E5E7EB"
                    />

                    <XAxis
                      type="number"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `Rs ${value}`}
                    />

                    <YAxis
                      type="category"
                      dataKey="_id"
                      width={130}
                      tick={{ fill: "#374151", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                      }}
                    />

                    <Bar
                      dataKey="revenue"
                      fill="#FF9F00"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No product sales available.
                </div>
              )}
            </div>
          </div>

          {/* SALES BREAKDOWN */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">
                Sales Breakdown
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Detailed revenue and order records.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Date</th>

                    <th className="px-5 py-4 font-semibold">Orders</th>

                    <th className="px-5 py-4 font-semibold">Revenue</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {trend.map((item, index) => (
                    <tr
                      key={index}
                      className="transition hover:bg-orange-50/40"
                    >
                      <td className="px-5 py-4 font-medium text-gray-700">
                        {formatDate(item)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">{item.orders}</td>

                      <td className="px-5 py-4 font-semibold text-[#E68F00]">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}

                  {!trend.length && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-12 text-center text-gray-400"
                      >
                        No sales records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
              <p className="text-xs text-gray-500">
                Showing {trend.length} sales records
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;
