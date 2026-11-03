import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Profile() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/my')
      .then(r => setOrders(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      {location.state?.orderSuccess && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Order placed successfully! Confirmation email sent.
        </div>
      )}
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="card mt-6 p-6">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-gray-500">{user?.email}</p>
      </div>
      <h2 className="mt-10 text-xl font-bold">Order history</h2>
      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <p className="mt-4 text-gray-500">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map(o => (
            <li key={o._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm">#{o._id.slice(-6).toUpperCase()}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] || ''}`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
              <p className="mt-1 font-bold text-brand-600">£{o.totalAmount.toFixed(2)} · {o.items?.length} items</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
