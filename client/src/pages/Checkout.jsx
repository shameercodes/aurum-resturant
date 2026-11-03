import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { sanitize, validators } from '../utils/fieldValidation';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zip: user?.address?.zip || '',
    phone: user?.phone || '',
    notes: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg">Please sign in to checkout</p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">Sign in</Link>
      </div>
    );
  }

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  const setField = (name, value) => setAddress(p => ({ ...p, [name]: value }));

  const submit = async e => {
    e.preventDefault();
    const fieldErrors = {
      street: address.street.trim().length < 3 ? 'Street address is required' : '',
      city: validators.name(address.city) || (address.city.length < 2 ? 'City is required' : ''),
      zip: validators.zip(address.zip),
      phone: validators.phone(address.phone),
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/api/orders', {
        items: items.map(i => ({ productId: i._id, quantity: i.quantity })),
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          zip: address.zip.trim(),
          phone: address.phone,
          notes: address.notes.trim(),
        },
        paymentMethod: payment,
      });
      clearCart();
      navigate('/profile', { state: { orderSuccess: true } });
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-semibold">Delivery address</h2>
          <ValidatedInput
            fieldType="street"
            name="street"
            placeholder="Street address"
            required
            value={address.street}
            onChange={v => setField('street', v)}
            error={errors.street}
          />
          <ValidatedInput
            fieldType="city"
            name="city"
            placeholder="City (letters only)"
            required
            value={address.city}
            onChange={v => setField('city', v)}
            error={errors.city}
          />
          <ValidatedInput
            fieldType="zip"
            name="zip"
            placeholder="Postcode"
            required
            value={address.zip}
            onChange={v => setField('zip', v)}
            error={errors.zip}
          />
          <ValidatedInput
            fieldType="phone"
            name="phone"
            placeholder="Phone (numbers only)"
            required
            value={address.phone}
            onChange={v => setField('phone', v)}
            error={errors.phone}
          />
          <textarea
            name="notes"
            value={address.notes}
            onChange={e => setField('notes', sanitize.text(e.target.value, 300))}
            placeholder="Delivery notes (optional)"
            rows={3}
            className="input-field"
          />
          <h2 className="pt-4 font-semibold">Payment</h2>
          {[
            { id: 'cod', label: 'Cash on delivery' },
            { id: 'mock', label: 'Card (mock payment)' },
          ].map(m => (
            <label key={m.id} className={`card flex cursor-pointer items-center gap-3 p-4 ${payment === m.id ? 'border-brand-500 ring-2 ring-brand-500/20' : ''}`}>
              <input type="radio" name="pay" checked={payment === m.id} onChange={() => setPayment(m.id)} />
              {m.label}
            </label>
          ))}
        </div>
        <div className="card h-fit p-6">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map(i => (
              <li key={i._id} className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{i.name} × {i.quantity}</span>
                <span>£{(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-brand-600">£{total.toFixed(2)}</span>
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
