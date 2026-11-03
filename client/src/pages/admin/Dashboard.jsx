import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import MenuItemModal from '../../components/admin/MenuItemModal';
import './Dashboard.css';

const TABS = ['Overview','Reservations','Menu','Messages'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('Overview');
  const [stats, setStats]     = useState(null);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages]         = useState([]);
  const [menuItems, setMenuItems]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [resFilter, setResFilter] = useState('all');
  const [menuModalItem, setMenuModalItem] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [resR, msgR, menuR] = await Promise.all([
        api.get('/api/reservations'),
        api.get('/api/contact'),
        api.get('/api/menu'),
      ]);
      const res  = resR.data.data;
      const msgs = msgR.data.data;
      const menu = menuR.data.data;

      setReservations(res);
      setMessages(msgs);
      setMenuItems(menu);
      setStats({
        totalReservations: res.length,
        pendingReservations: res.filter(r => r.status === 'pending').length,
        confirmedReservations: res.filter(r => r.status === 'confirmed').length,
        totalMessages: msgs.length,
        unreadMessages: msgs.filter(m => !m.read).length,
        totalMenuItems: menu.length,
        featuredItems: menu.filter(m => m.featured).length,
        todayReservations: res.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await api.patch(`/api/reservations/${id}`, { status });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) { alert(err.displayMessage); }
  };

  const markMessageRead = async (id, read) => {
    try {
      await api.patch(`/api/contact/${id}`, { read });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read } : m));
    } catch (err) { alert(err.displayMessage); }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await api.delete(`/api/reservations/${id}`);
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (err) { alert(err.displayMessage); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/api/contact/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) { alert(err.displayMessage); }
  };

  const toggleFeatured = async (item) => {
    try {
      const r = await api.patch(`/api/menu/${item._id}`, { featured: !item.featured });
      setMenuItems(prev => prev.map(m => m._id === item._id ? r.data.data : m));
    } catch (err) { alert(err.displayMessage); }
  };

  const buildMenuFormData = ({ form, file }) => {
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('category', form.category);
    fd.append('price', form.price);
    fd.append('description', form.description.trim());
    fd.append('badges', form.badges);
    fd.append('spiceLevel', form.spiceLevel);
    fd.append('isVegetarian', form.isVegetarian);
    fd.append('featured', form.featured);
    if (file) fd.append('image', file);
    else if (form.imageUrl?.trim()) fd.append('image', form.imageUrl.trim());
    return fd;
  };

  const saveMenuItem = async ({ form, file, isEdit, itemId }) => {
    const fd = buildMenuFormData({ form, file });
    if (isEdit) {
      await api.patch(`/api/menu/${itemId}`, fd);
    } else {
      await api.post('/api/menu', fd);
    }
    await fetchAll();
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('Delete this menu item permanently?')) return;
    try {
      await api.delete(`/api/menu/${id}`);
      setMenuItems(prev => prev.filter(m => m._id !== id));
      setStats(s => s ? { ...s, totalMenuItems: s.totalMenuItems - 1 } : s);
    } catch (err) { alert(err.displayMessage); }
  };

  const filteredReservations = resFilter === 'all'
    ? reservations
    : reservations.filter(r => r.status === resFilter);

  const statusColor = s => ({ pending:'#E9A23B', confirmed:'#27AE60', cancelled:'#E74C3C' }[s] || '#888');

  return (
    <div className="dash">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Link to="/" className="dash-logo">Aurum</Link>
          <span>Admin Panel</span>
        </div>
        <nav className="dash-nav">
          {TABS.map(t => (
            <button key={t} className={`dash-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <span className="dash-nav-icon">
                {t === 'Overview' ? '◉' : t === 'Reservations' ? '📅' : t === 'Menu' ? '🍽' : '✉'}
              </span>
              {t}
              {t === 'Reservations' && stats?.pendingReservations > 0 && (
                <span className="dash-badge">{stats.pendingReservations}</span>
              )}
              {t === 'Messages' && stats?.unreadMessages > 0 && (
                <span className="dash-badge">{stats.unreadMessages}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="dash-user">
          <div className="dash-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div>
            <div className="dash-user-name">{user?.name}</div>
            <div className="dash-user-role">{user?.role}</div>
          </div>
          <button className="dash-logout" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>{tab}</h1>
            <p>{new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <Link to="/" className="dash-visit-site" target="_blank" rel="noreferrer">↗ View Site</Link>
        </header>

        {loading ? (
          <div className="dash-loading"><div className="spinner"/></div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && (
              <div className="dash-overview">
                <div className="stat-cards">
                  {[
                    { label:'Total Reservations', value: stats?.totalReservations,     color:'var(--gold)' },
                    { label:'Pending Approval',   value: stats?.pendingReservations,   color:'#E9A23B' },
                    { label:'Confirmed Today',    value: stats?.todayReservations,     color:'#27AE60' },
                    { label:'Unread Messages',    value: stats?.unreadMessages,        color:'#3B82F6' },
                    { label:'Menu Items',         value: stats?.totalMenuItems,        color:'var(--gold)' },
                    { label:'Featured Dishes',    value: stats?.featuredItems,         color:'var(--gold-dark)' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <span className="stat-card-label">{s.label}</span>
                      <strong className="stat-card-value" style={{ color: s.color }}>{s.value ?? '—'}</strong>
                    </div>
                  ))}
                </div>

                {/* Recent reservations */}
                <div className="dash-section">
                  <div className="dash-section-header">
                    <h2>Recent Reservations</h2>
                    <button className="dash-link-btn" onClick={() => setTab('Reservations')}>View all →</button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead>
                      <tbody>
                        {reservations.slice(0, 6).map(r => (
                          <tr key={r._id}>
                            <td><strong>{r.firstName} {r.lastName}</strong><span className="sub">{r.email}</span></td>
                            <td>{r.date}</td>
                            <td>{r.time}</td>
                            <td>{r.guests}</td>
                            <td><span className="status-pill" style={{ color: statusColor(r.status), borderColor: statusColor(r.status) }}>{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent messages */}
                <div className="dash-section">
                  <div className="dash-section-header">
                    <h2>Recent Messages</h2>
                    <button className="dash-link-btn" onClick={() => setTab('Messages')}>View all →</button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead><tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {messages.slice(0, 5).map(m => (
                          <tr key={m._id} className={!m.read ? 'unread-row' : ''}>
                            <td><strong>{m.name}</strong><span className="sub">{m.email}</span></td>
                            <td>{m.subject}</td>
                            <td>{new Date(m.createdAt).toLocaleDateString('en-GB')}</td>
                            <td><span className={`msg-status ${m.read ? 'read' : 'unread'}`}>{m.read ? 'Read' : 'Unread'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESERVATIONS ── */}
            {tab === 'Reservations' && (
              <div className="dash-section">
                <div className="dash-section-header">
                  <h2>{reservations.length} Reservations</h2>
                  <div className="dash-filters">
                    {['all','pending','confirmed','cancelled'].map(s => (
                      <button
                        key={s}
                        className={`filter-btn ${resFilter === s ? 'active' : ''}`}
                        onClick={() => setResFilter(s)}
                      >
                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Occasion</th><th>Requests</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredReservations.map(r => (
                        <tr key={r._id}>
                          <td>
                            <strong>{r.firstName} {r.lastName}</strong>
                            <span className="sub">{r.email}</span>
                            <span className="sub">{r.phone}</span>
                          </td>
                          <td>{r.date}</td>
                          <td>{r.time}</td>
                          <td>{r.guests}</td>
                          <td>{r.occasion !== 'None' ? r.occasion : '—'}</td>
                          <td className="truncate-cell">{r.specialRequests || '—'}</td>
                          <td>
                            <select
                              className="status-select"
                              value={r.status}
                              style={{ color: statusColor(r.status) }}
                              onChange={e => updateReservationStatus(r._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button className="action-btn danger" onClick={() => deleteReservation(r._id)} title="Delete">🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── MENU ── */}
            {tab === 'Menu' && (
              <div className="dash-section">
                <div className="dash-section-header">
                  <h2>{menuItems.length} Menu Items</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="menu-cats">
                      {['starters','mains','desserts','cocktails'].map(c => (
                        <span key={c} className="cat-pill">{c} ({menuItems.filter(m => m.category === c).length})</span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="dash-add-btn"
                      onClick={() => { setMenuModalItem(null); setShowMenuModal(true); }}
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
                <div className="menu-admin-grid">
                  {menuItems.map(item => (
                    <div key={item._id} className="menu-admin-card">
                      <div className="mac-img">
                        <img src={item.image} alt={item.name} loading="lazy"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'; }}/>
                        <span className="mac-cat">{item.category}</span>
                      </div>
                      <div className="mac-body">
                        <div className="mac-top">
                          <strong>{item.name}</strong>
                          <span className="mac-price">£{item.price}</span>
                        </div>
                        <p className="mac-desc">{item.description}</p>
                        <div className="mac-actions">
                          <label className="featured-toggle" title={item.featured ? 'Remove from featured' : 'Add to featured'}>
                            <input type="checkbox" checked={item.featured} onChange={() => toggleFeatured(item)}/>
                            <span>{item.featured ? '★ Featured' : '☆ Feature'}</span>
                          </label>
                          {item.isVegetarian && <span className="veg-tag">Veg</span>}
                        </div>
                        <div className="mac-btn-row">
                          <button type="button" className="mac-btn" onClick={() => { setMenuModalItem(item); setShowMenuModal(true); }}>Edit</button>
                          <button type="button" className="mac-btn danger" onClick={() => deleteMenuItem(item._id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MESSAGES ── */}
            {tab === 'Messages' && (
              <div className="dash-section">
                <div className="dash-section-header">
                  <h2>{messages.length} Messages <span className="unread-count">({messages.filter(m=>!m.read).length} unread)</span></h2>
                </div>
                <div className="messages-list">
                  {messages.map(m => (
                    <div key={m._id} className={`msg-card ${!m.read ? 'msg-unread' : ''}`}>
                      <div className="msg-meta">
                        <div>
                          <strong>{m.name}</strong>
                          <span className="sub">{m.email}</span>
                        </div>
                        <div className="msg-right">
                          <span className="msg-date">{new Date(m.createdAt).toLocaleDateString('en-GB')}</span>
                          <div className="msg-actions">
                            <button className="action-btn" onClick={() => markMessageRead(m._id, !m.read)} title={m.read ? 'Mark unread' : 'Mark read'}>
                              {m.read ? '📭' : '📬'}
                            </button>
                            <button className="action-btn danger" onClick={() => deleteMessage(m._id)} title="Delete">🗑</button>
                          </div>
                        </div>
                      </div>
                      <div className="msg-subject">{m.subject}</div>
                      <p className="msg-body">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showMenuModal && (
        <MenuItemModal
          item={menuModalItem}
          onClose={() => { setShowMenuModal(false); setMenuModalItem(null); }}
          onSave={saveMenuItem}
        />
      )}
    </div>
  );
}
