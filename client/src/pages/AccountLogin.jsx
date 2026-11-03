import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthGuest.css';

export default function AccountLogin() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/reservations';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    navigate(user.role === 'admin' ? '/admin/dashboard' : redirect, { replace: true });
  }

  const onChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err.displayMessage || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="guest-auth-page">
      <div className="guest-auth-card">
        <Link to="/" className="guest-auth-logo">Aurum</Link>
        <h1>Sign In</h1>
        <p className="guest-auth-sub">Sign in to book your table</p>

        <form onSubmit={onSubmit} className="guest-auth-form" noValidate>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input id="email" type="email" name="email" value={form.email} onChange={onChange} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input id="password" type="password" name="password" value={form.password} onChange={onChange} required />
          </div>
          {error && <div className="guest-auth-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-gold guest-auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="guest-auth-switch">
          New guest? <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Create an account</Link>
        </p>
        <Link to="/" className="guest-auth-back">← Back to website</Link>
      </div>
    </div>
  );
}
