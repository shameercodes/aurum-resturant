import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { validators } from '../utils/fieldValidation';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    const fieldErrors = { otp: validators.otp(otp) };
    if (!password || password.length < 8) fieldErrors.password = 'Password must be at least 8 characters';
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    try {
      await resetPassword(email, otp, password);
      navigate('/');
    } catch (err) {
      setError(err.displayMessage);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <ValidatedInput
          fieldType="otp"
          placeholder="6-digit code (numbers only)"
          required
          value={otp}
          onChange={setOtp}
          error={errors.otp}
          className="input-field text-center text-2xl tracking-[0.5em]"
        />
        <input
          type="password"
          className="input-field"
          placeholder="New password"
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="btn-primary w-full">Reset password</button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm text-brand-600">Login</Link>
    </div>
  );
}
