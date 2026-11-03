import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { validators } from '../utils/fieldValidation';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    const fieldErrors = {
      name: validators.name(form.name),
      email: validators.email(form.email),
    };
    if (!form.password || form.password.length < 8) {
      fieldErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setLoading(true);
    setError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      setError(err.displayMessage);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-bold">Create account</h1>
      <p className="mt-2 text-gray-500">We'll email you a 6-digit verification code</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <ValidatedInput
          fieldType="name"
          placeholder="Full name (letters only)"
          required
          value={form.name}
          onChange={v => setForm({ ...form, name: v })}
          error={errors.name}
        />
        <ValidatedInput
          fieldType="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={v => setForm({ ...form, email: v })}
          error={errors.email}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password (min 8 chars)"
          required
          minLength={8}
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending OTP…' : 'Register'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
      </p>
    </div>
  );
}
