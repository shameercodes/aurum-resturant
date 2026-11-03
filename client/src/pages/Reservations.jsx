import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import useReveal from '../hooks/useReveal';
import { IconPhone, IconMail, IconMapPin } from '../components/Icons';
import AllergenBar from '../components/AllergenBar';
import './Reservations.css';

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', date: '', time: '',
  guests: '2', occasion: 'None', specialRequests: '',
};

function splitName(full) {
  const parts = (full || '').trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export default function Reservations() {
  useReveal(0.1);
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      const { firstName, lastName } = splitName(user.name);
      setForm(p => ({
        ...p,
        firstName: p.firstName || firstName,
        lastName: p.lastName || lastName,
        email: user.email,
      }));
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.date) e.date = 'Select a date';
    if (!form.time) e.time = 'Select a time';
    return e;
  };

  const onChange = useCallback(e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: undefined }));
  }, []);

  const onSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('loading');
    try {
      await api.post('/api/reservations', { ...form, guests: Number(form.guests) });
      setStatus('success');
    } catch (err) {
      setStatus(null);
      setErrors({ _form: err.displayMessage });
    }
  };

  if (authLoading) {
    return (
      <main className="res-page">
        <div className="res-auth-loading"><div className="spinner" /></div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="res-page">
        <section className="page-hero">
          <div className="page-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=2000&q=90')" }} />
          <div className="page-hero-content">
            <span className="eyebrow">Join Us</span>
            <h1>Reserve Your <em>Table</em></h1>
            <p>Create a free account to book at Aurum</p>
          </div>
        </section>
        <div className="divider" />
        <section className="section">
          <div className="container res-auth-gate reveal">
            <h2 className="section-title">Sign in to <em>Reserve</em></h2>
            <p className="lead" style={{ margin: '16px auto 28px', textAlign: 'center', maxWidth: '480px' }}>
              For your security and ours, table reservations require a registered guest account.
              It only takes a minute.
            </p>
            <div className="res-auth-actions">
              <Link to="/register?redirect=/reservations" className="btn btn-gold">Create Account</Link>
              <Link to="/account/login?redirect=/reservations" className="btn btn-outline">Sign In</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="res-page">
      <section className="page-hero">
        <div className="page-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=2000&q=90')" }} />
        <div className="page-hero-content">
          <span className="eyebrow">Join Us</span>
          <h1>Reserve Your <em>Table</em></h1>
          <p>Welcome back, {user.name?.split(' ')[0]}</p>
        </div>
      </section>
      <div className="divider" />

      <section className="section">
        <div className="container res-layout">
          <aside className="res-aside reveal">
            <div className="aside-block res-account-block">
              <h3>Your Account</h3>
              <p className="res-account-email">{user.email}</p>
              <button type="button" className="res-signout" onClick={logout}>Sign out</button>
            </div>
            <div className="aside-block">
              <h3>Opening Hours</h3>
              <div className="hours-list">
                {[
                  ['Tuesday – Thursday', '12:00 – 22:00'],
                  ['Friday – Saturday', '12:00 – 22:30'],
                  ['Sunday', '12:00 – 20:30'],
                  ['Monday', 'Closed'],
                ].map(([day, time]) => (
                  <div key={day} className={`hours-row ${time === 'Closed' ? 'closed' : ''}`}>
                    <span>{day}</span><span>{time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="aside-block">
              <h3>Contact</h3>
              <div className="aside-row">
                <span className="aside-icon"><IconPhone size={16} /></span>
                <a href="tel:+442079460823">+44 (0) 20 7946 0823</a>
              </div>
              <div className="aside-row">
                <span className="aside-icon"><IconMail size={16} /></span>
                <a href="mailto:hello@aurumrestaurant.co.uk">hello@aurumrestaurant.co.uk</a>
              </div>
              <div className="aside-row">
                <span className="aside-icon"><IconMapPin size={16} /></span>
                <span>14 Golden Square, London W1F 9HT</span>
              </div>
            </div>
            <div className="aside-block">
              <h3>Good to Know</h3>
              {[
                'Tables held for 15 minutes past reservation',
                'Smart casual dress code',
                'Children welcome before 19:00',
                'Private dining for 8–20 guests',
                'Valet parking at neighbouring hotels',
              ].map(n => (
                <div key={n} className="aside-note">
                  <span className="note-dot" /><span>{n}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="res-form-col reveal form-panel">
            {status === 'success' ? (
              <div className="success-box">
                <div className="success-icon">✓</div>
                <h3>Table Reserved</h3>
                <p>
                  Thank you, <strong>{form.firstName} {form.lastName}</strong>.
                  <br />We will confirm within two hours at <strong>{form.email}</strong>.
                </p>
                <div className="success-summary">
                  {[
                    ['Date', form.date],
                    ['Time', form.time],
                    ['Guests', form.guests],
                    form.occasion !== 'None' && ['Occasion', form.occasion],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="ss-row"><span>{k}</span><strong>{v}</strong></div>
                  ))}
                </div>
                <button type="button" className="btn btn-ghost" style={{ marginTop: '20px' }} onClick={() => { setStatus(null); setForm(p => ({ ...EMPTY, email: user.email, ...splitName(user.name) })); }}>
                  Make Another Reservation
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="booking-form">
                <div className="form-section-title">Your Details</div>
                <div className="form-row-2">
                  <div className={`field ${errors.firstName ? 'has-error' : ''}`}>
                    <label>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={onChange} placeholder="Alexandra" />
                    {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                  </div>
                  <div className={`field ${errors.lastName ? 'has-error' : ''}`}>
                    <label>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Whitmore" />
                    {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="form-row-2">
                  <div className={`field ${errors.email ? 'has-error' : ''}`}>
                    <label>Email *</label>
                    <input type="email" name="email" value={form.email} onChange={onChange} readOnly title="Must match your account email" />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className={`field ${errors.phone ? 'has-error' : ''}`}>
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={onChange} placeholder="+44 7700 900000" />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>
                <div className="form-section-title" style={{ marginTop: '24px' }}>Booking Details</div>
                <div className="form-row-2">
                  <div className={`field ${errors.date ? 'has-error' : ''}`}>
                    <label>Date *</label>
                    <input type="date" name="date" value={form.date} onChange={onChange} min={minDate} />
                    {errors.date && <span className="field-error">{errors.date}</span>}
                  </div>
                  <div className={`field ${errors.time ? 'has-error' : ''}`}>
                    <label>Time *</label>
                    <select name="time" value={form.time} onChange={onChange}>
                      <option value="">Select time</option>
                      <optgroup label="Lunch">
                        {['12:00', '12:30', '13:00', '13:30', '14:00'].map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                      <optgroup label="Dinner">
                        {['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                    </select>
                    {errors.time && <span className="field-error">{errors.time}</span>}
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="field">
                    <label>Guests *</label>
                    <select name="guests" value={form.guests} onChange={onChange}>
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Occasion</label>
                    <select name="occasion" value={form.occasion} onChange={onChange}>
                      {['None', 'Anniversary', 'Birthday', 'Business Dinner', 'Proposal', 'Other'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Special Requests / Allergies</label>
                  <textarea name="specialRequests" value={form.specialRequests} onChange={onChange} placeholder="Dietary requirements, allergies, high chair, wine preferences…" rows="3" />
                </div>
                {errors._form && <div className="form-err-msg">{errors._form}</div>}
                <button type="submit" className="btn btn-gold submit-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Confirming…' : 'Confirm Reservation'}
                </button>
                <p className="form-fine-print">
                  Reservation email must match your account ({user.email}).
                </p>
              </form>
            )}
          </div>
        </div>
        <div className="container">
          <AllergenBar variant="banner" />
        </div>
      </section>
    </main>
  );
}
