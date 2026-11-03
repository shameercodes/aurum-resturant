import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { validators } from '../utils/fieldValidation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    const emailErr = validators.email(form.email);
    if (emailErr || !form.password) {
      setErrors({ email: emailErr, password: !form.password ? 'Password is required' : '' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      } else {
        setError(err.displayMessage);
        setLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <ValidatedInput fieldType="email" placeholder="Email" required value={form.email} onChange={v => setForm({ ...form, email: v })} error={errors.email} />
        <input type="password" className="input-field" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/forgot-password" className="text-brand-600">Forgot password?</Link></p>
      <p className="mt-4 text-center text-sm text-gray-500">
        New here? <Link to="/register" className="font-semibold text-brand-600">Register</Link>
      </p>
    </div>
  );
}
