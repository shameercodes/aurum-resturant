import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { validators } from '../utils/fieldValidation';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    const err = validators.email(email);
    setEmailError(err);
    if (err) return;
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.displayMessage);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      {sent ? (
        <p className="mt-4 text-gray-600">If an account exists, we sent a reset code. <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="text-brand-600">Enter code</Link></p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <ValidatedInput fieldType="email" placeholder="Email" required value={email} onChange={setEmail} error={emailError} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">Send reset code</button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm text-brand-600">Back to login</Link>
    </div>
  );
}
