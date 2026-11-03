import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ValidatedInput from '../components/ValidatedInput';
import { validators } from '../utils/fieldValidation';

const OTP_SECONDS = 60;

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(OTP_SECONDS);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const submit = async e => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await verifyOtp(email, otp);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.displayMessage);
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await resendOtp(email);
      setTimer(OTP_SECONDS);
      setError('');
    } catch (err) {
      setError(err.displayMessage);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold">Verify email</h1>
      <p className="mt-2 text-gray-500">Enter the 6-digit code we sent to <strong>{email}</strong></p>
      <form onSubmit={submit} className="mt-8">
        <ValidatedInput
          fieldType="otp"
          value={otp}
          onChange={setOtp}
          className="input-field text-center text-2xl tracking-[0.5em]"
          placeholder="000000"
          required
          error={otp.length > 0 && otp.length < 6 ? validators.otp(otp) : ''}
        />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
      <button
        type="button"
        onClick={resend}
        disabled={timer > 0}
        className="mt-6 text-sm font-medium text-brand-600 disabled:text-gray-400"
      >
        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
      </button>
    </div>
  );
}
