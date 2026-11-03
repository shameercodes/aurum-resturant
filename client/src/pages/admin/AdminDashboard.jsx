import { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiRefreshCw,
  FiEdit2, FiTrash2, FiPlus, FiSearch, FiAlertTriangle, FiX, FiCheck,
  FiTrendingUp, FiClock, FiLogOut,
} from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FoodImage from '../../components/FoodImage';
import ValidatedInput from '../../components/ValidatedInput';
import { sanitize, validators } from '../../utils/fieldValidation';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: FiTrendingUp },
  { id: 'orders', label: 'Orders', icon: FiShoppingCart },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'users', label: 'Users', icon: FiUsers },
];

const ORDER_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const CATEGORIES = ['Pizza', 'Burgers', 'Drinks', 'Desserts'];

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
        </div>
        <span className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/15">
          <Icon className="text-xl" />
        </span>
      </div>
    </div>
  );
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}>
      {children}
    </span>
  );
}

function fmtDate(d) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const emptyProduct = { name: '', description: '', price: '', category: 'Pizza', stock: '50', rating: '4.5', image: '', isActive: true };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [productSearch, setProductSearch] = useState('');
  const [productCat, setProductCat] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [formErrors, setFormErrors] = useState({});
  const [file, setFile] = useState(null);

  const toast = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const loadDashboard = useCallback(async () => {
    const { data } = await api.get('/api/admin/dashboard');
    setStats(data.data);
  }, []);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (productCat !== 'all') params.set('category', productCat);
    if (productSearch.trim()) params.set('search', productSearch.trim());
    const { data } = await api.get(`/api/admin/products?${params}`);
    setProducts(data.data);
  }, [productCat, productSearch]);

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (orderStatus !== 'all') params.set('status', orderStatus);
    if (orderSearch.trim()) params.set('search', orderSearch.trim());
    const { data } = await api.get(`/api/admin/orders?${params}`);
    setOrders(data.data);
  }, [orderStatus, orderSearch]);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (userSearch.trim()) params.set('search', userSearch.trim());
    const { data } = await api.get(`/api/admin/users?${params}`);
    setUsers(data.data);
  }, [userSearch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadDashboard(), loadProducts(), loadOrders(), loadUsers()]);
    } catch {
      toast('Failed to load data', 'err');
    } finally {
      setLoading(false);
    }
  }, [loadDashboard, loadProducts, loadOrders, loadUsers]);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (tab === 'products') loadProducts();
  }, [tab, productSearch, productCat, loadProducts]);

  useEffect(() => {
    if (tab === 'orders') loadOrders();
  }, [tab, orderSearch, orderStatus, loadOrders]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
  }, [tab, userSearch, loadUsers]);

  const saveProduct = async e => {
    e.preventDefault();
    const fieldErrors = {
      name: form.name.trim().length < 2 ? 'Name is required' : '',
      description: validators.description(form.description),
      price: validators.price(form.price),
      stock: validators.stock(form.stock),
      rating: form.rating ? validators.rating(form.rating) : '',
    };
    if (!file && !form.image && !editingProduct) {
      fieldErrors.image = 'Image or image URL is required';
    }
    setFormErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'isActive') fd.append(k, v ? 'true' : 'false');
        else if (v !== '' && v !== null) fd.append(k, v);
      });
      if (file) fd.append('image', file);
      if (editingProduct) {
        await api.patch(`/api/products/${editingProduct._id}`, fd);
        toast('Product updated');
      } else {
        await api.post('/api/products', fd);
        toast('Product added');
      }
      setForm(emptyProduct);
      setFile(null);
      setEditingProduct(null);
      setShowProductForm(false);
      await loadProducts();
      await loadDashboard();
    } catch (err) {
      toast(err.response?.data?.message || 'Save failed', 'err');
    }
  };

  const startEditProduct = p => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      rating: String(p.rating ?? 4.5),
      image: p.image || '',
      isActive: p.isActive !== false,
    });
    setFile(null);
    setShowProductForm(true);
  };

  const deleteProduct = async id => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast('Product deleted');
      loadProducts();
      loadDashboard();
    } catch {
      toast('Delete failed', 'err');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      toast('Order status updated');
      loadOrders();
      loadDashboard();
    } catch {
      toast('Update failed', 'err');
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await api.patch(`/api/admin/users/${id}`, { role });
      toast('User role updated');
      loadUsers();
      loadDashboard();
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'err');
    }
  };

  const toggleUserVerified = async (id, isVerified) => {
    try {
      await api.patch(`/api/admin/users/${id}`, { isVerified });
      toast(isVerified ? 'User verified' : 'Verification removed');
      loadUsers();
    } catch {
      toast('Update failed', 'err');
    }
  };

  const deleteUser = async id => {
    if (!window.confirm('Delete this user? Their orders will remain.')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast('User deleted');
      loadUsers();
      loadDashboard();
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed', 'err');
    }
  };

  const maxStatus = Math.max(...(stats?.statusCounts?.map(s => s.count) || [1]), 1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {msg && (
        <div
          className={`fixed right-4 top-20 z-[60] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            msg.type === 'err' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {msg.type === 'err' ? <FiAlertTriangle /> : <FiCheck />}
          {msg.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.name ? `Signed in as ${user.name}` : 'Manage orders, products, users & analytics'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-neutral-900 dark:hover:bg-red-950/30"
            >
              <FiLogOut /> Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-px dark:border-gray-800">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              <Icon />
              {label}
              {id === 'orders' && stats && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                  {stats.totalOrders}
                </span>
              )}
              {id === 'products' && stats && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{stats.totalProducts}</span>
              )}
              {id === 'users' && stats && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{stats.totalUsers}</span>
              )}
            </button>
          ))}
        </div>

        {loading && tab === 'dashboard' ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'dashboard' && stats && (
              <div className="mt-8 space-y-8 animate-fade-in">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <StatCard icon={FiShoppingCart} label="Total orders" value={stats.totalOrders} sub={`${stats.ordersToday} today`} />
                  <StatCard icon={FiDollarSign} label="Revenue" value={`£${stats.totalRevenue?.toFixed(2)}`} sub="excl. cancelled" />
                  <StatCard icon={FiUsers} label="Customers" value={stats.totalUsers} />
                  <StatCard icon={FiPackage} label="Products" value={stats.totalProducts} />
                  <StatCard icon={FiClock} label="Pending" value={stats.pendingOrders} sub="needs action" />
                  <StatCard icon={FiTrendingUp} label="Today" value={stats.ordersToday} sub="new orders" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="card p-6">
                    <h2 className="font-semibold">Orders by status</h2>
                    <div className="mt-4 space-y-3">
                      {ORDER_STATUSES.map(st => {
                        const row = stats.statusCounts?.find(s => s._id === st);
                        const count = row?.count || 0;
                        return (
                          <div key={st}>
                            <div className="flex justify-between text-sm">
                              <span className="capitalize text-gray-600 dark:text-gray-400">{st.replace(/_/g, ' ')}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-full rounded-full bg-brand-500 transition-all"
                                style={{ width: `${(count / maxStatus) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="font-semibold">Menu by category</h2>
                    <ul className="mt-4 space-y-2">
                      {stats.categoryBreakdown?.map(c => (
                        <li key={c._id} className="flex justify-between text-sm">
                          <span>{c._id}</span>
                          <span className="text-gray-500">{c.count} items · avg £{c.avgPrice?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="card p-6">
                    <h2 className="font-semibold">Top selling items</h2>
                    {stats.topProducts?.length ? (
                      <ul className="mt-4 space-y-2">
                        {stats.topProducts.map((p, i) => (
                          <li key={p._id} className="flex justify-between text-sm">
                            <span>{i + 1}. {p._id}</span>
                            <span className="text-gray-500">{p.sold} sold · £{p.revenue?.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500">No sales data yet</p>
                    )}
                  </div>

                  <div className="card p-6">
                    <h2 className="flex items-center gap-2 font-semibold text-amber-600">
                      <FiAlertTriangle /> Low stock (≤10)
                    </h2>
                    {stats.lowStockProducts?.length ? (
                      <ul className="mt-4 space-y-2">
                        {stats.lowStockProducts.map(p => (
                          <li key={p._id} className="flex justify-between text-sm">
                            <span>{p.name}</span>
                            <span className="font-medium text-red-500">{p.stock} left</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500">All items well stocked</p>
                    )}
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <h2 className="font-semibold">Recent orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                        <tr>
                          <th className="p-3">Order</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders?.map(o => (
                          <tr key={o._id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="p-3 font-mono">#{o._id.slice(-8)}</td>
                            <td>{o.user?.name || '—'}<br /><span className="text-xs text-gray-500">{o.user?.email}</span></td>
                            <td className="font-medium">£{o.totalAmount?.toFixed(2)}</td>
                            <td><Badge className={statusColor[o.status]}>{o.status?.replace(/_/g, ' ')}</Badge></td>
                            <td className="text-gray-500">{fmtDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[200px] flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input-field !pl-10"
                      placeholder="Search order ID, name, email, phone..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                    />
                  </div>
                  <select className="input-field w-auto" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                  <span className="self-center text-sm text-gray-500">{orders.length} records</span>
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                        <tr>
                          <th className="p-3">Order</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <Fragment key={o._id}>
                            <tr className="border-t border-gray-100 dark:border-gray-800">
                              <td className="p-3 font-mono text-xs">#{o._id.slice(-8)}</td>
                              <td>
                                <p className="font-medium">{o.user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500">{o.user?.email}</p>
                                <p className="text-xs text-gray-500">{o.address?.phone}</p>
                              </td>
                              <td>{o.items?.length} item(s)</td>
                              <td className="font-bold text-brand-600">£{o.totalAmount?.toFixed(2)}</td>
                              <td>
                                <span className="capitalize">{o.paymentMethod}</span>
                                <br />
                                <span className="text-xs text-gray-500">{o.paymentStatus}</span>
                              </td>
                              <td>
                                <select
                                  value={o.status}
                                  onChange={e => updateOrderStatus(o._id, e.target.value)}
                                  className="input-field !py-1 !text-xs min-w-[130px]"
                                >
                                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                              </td>
                              <td className="whitespace-nowrap text-gray-500">{fmtDate(o.createdAt)}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                                  className="text-brand-600 text-xs font-medium hover:underline"
                                >
                                  {expandedOrder === o._id ? 'Hide' : 'Details'}
                                </button>
                              </td>
                            </tr>
                            {expandedOrder === o._id && (
                              <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <td colSpan={8} className="p-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="text-xs font-semibold uppercase text-gray-500">Delivery address</p>
                                      <p className="mt-1 text-sm">{o.address?.street}, {o.address?.city} {o.address?.zip}</p>
                                      {o.address?.notes && <p className="text-sm text-gray-500">Note: {o.address.notes}</p>}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase text-gray-500">Line items</p>
                                      <ul className="mt-2 space-y-2">
                                        {o.items?.map((item, i) => (
                                          <li key={i} className="flex items-center gap-3 text-sm">
                                            <FoodImage product={{ image: item.image, name: item.name, category: 'Pizza' }} className="h-10 w-10 rounded-lg object-cover" />
                                            <span className="flex-1">{item.name} × {item.quantity}</span>
                                            <span className="font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                    {!orders.length && <p className="p-8 text-center text-gray-500">No orders found</p>}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-1 flex-wrap gap-3">
                    <div className="relative min-w-[180px] flex-1">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="input-field !pl-10"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                      />
                    </div>
                    <select className="input-field w-auto" value={productCat} onChange={e => setProductCat(e.target.value)}>
                      <option value="all">All categories</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <span className="self-center text-sm text-gray-500">{products.length} records</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingProduct(null); setForm(emptyProduct); setShowProductForm(true); }}
                    className="btn-primary !py-2 !px-4 text-sm"
                  >
                    <FiPlus /> Add product
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={saveProduct} className="card space-y-3 p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{editingProduct ? 'Edit product' : 'New product'}</h2>
                      <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="p-1 text-gray-500">
                        <FiX />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ValidatedInput
                        fieldType="text"
                        placeholder="Name"
                        required
                        value={form.name}
                        onChange={v => setForm({ ...form, name: sanitize.text(v, 100) })}
                        error={formErrors.name}
                      />
                      <ValidatedInput
                        fieldType="price"
                        placeholder="Price (numbers only)"
                        required
                        value={form.price}
                        onChange={v => setForm({ ...form, price: v })}
                        error={formErrors.price}
                      />
                      <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ValidatedInput
                        fieldType="stock"
                        placeholder="Stock (whole numbers)"
                        required
                        value={form.stock}
                        onChange={v => setForm({ ...form, stock: v })}
                        error={formErrors.stock}
                      />
                      <ValidatedInput
                        fieldType="rating"
                        placeholder="Rating 0–5"
                        value={form.rating}
                        onChange={v => setForm({ ...form, rating: v })}
                        error={formErrors.rating}
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                        Active on menu
                      </label>
                    </div>
                    <div>
                      <textarea
                        className="input-field"
                        placeholder="Description"
                        required
                        rows={2}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: sanitize.text(e.target.value, 500) })}
                      />
                      {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>}
                    </div>
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />
                    <input className="input-field" placeholder="Or image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                    {formErrors.image && <p className="text-xs text-red-500">{formErrors.image}</p>}
                    <button type="submit" className="btn-primary w-full sm:w-auto">
                      {editingProduct ? 'Save changes' : 'Create product'}
                    </button>
                  </form>
                )}

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                        <tr>
                          <th className="p-3">Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Rating</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <FoodImage product={p} className="h-12 w-12 rounded-lg object-cover" />
                                <div>
                                  <p className="font-medium">{p.name}</p>
                                  <p className="line-clamp-1 max-w-xs text-xs text-gray-500">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td>{p.category}</td>
                            <td className="font-medium text-brand-600">£{p.price?.toFixed(2)}</td>
                            <td>
                              <span className={p.stock <= 10 ? 'font-semibold text-red-500' : ''}>{p.stock}</span>
                            </td>
                            <td>{p.rating?.toFixed(1)}</td>
                            <td>
                              <Badge className={p.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                                {p.isActive !== false ? 'Active' : 'Hidden'}
                              </Badge>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => startEditProduct(p)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10" title="Edit">
                                  <FiEdit2 />
                                </button>
                                <button type="button" onClick={() => deleteProduct(p._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!products.length && <p className="p-8 text-center text-gray-500">No products found</p>}
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <div className="relative max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input-field !pl-10"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500">{users.length} records</p>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                        <tr>
                          <th className="p-3">User</th>
                          <th>Role</th>
                          <th>Verified</th>
                          <th>Phone</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="p-3">
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td>
                              <select
                                value={u.role}
                                onChange={e => updateUserRole(u._id, e.target.value)}
                                className="input-field !py-1 !text-xs"
                                disabled={u.role === 'admin'}
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => toggleUserVerified(u._id, !u.isVerified)}
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  u.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {u.isVerified ? 'Verified' : 'Unverified'}
                              </button>
                            </td>
                            <td className="text-gray-500">{u.phone || '—'}</td>
                            <td className="whitespace-nowrap text-gray-500">{fmtDate(u.createdAt)}</td>
                            <td>
                              {u.role !== 'admin' && (
                                <button type="button" onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-600">
                                  <FiTrash2 />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!users.length && <p className="p-8 text-center text-gray-500">No users found</p>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
