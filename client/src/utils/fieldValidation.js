/** Client-side sanitizers — block wrong character types while typing */

export const sanitize = {
  name: v =>
    String(v).replace(/[^a-zA-Z\s'.-]/g, '').replace(/\s+/g, ' ').slice(0, 60),

  text: (v, max = 200) =>
    String(v).replace(/[^a-zA-Z0-9\s.,'#/()-]/g, '').slice(0, max),

  address: (v, max = 120) =>
    String(v).replace(/[^a-zA-Z0-9\s.,'#/-]/g, '').slice(0, max),

  city: v =>
    String(v).replace(/[^a-zA-Z\s.-]/g, '').slice(0, 80),

  zip: v =>
    String(v).replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase().slice(0, 12),

  phone: v => String(v).replace(/\D/g, '').slice(0, 15),

  digits: (v, max = 20) => String(v).replace(/\D/g, '').slice(0, max),

  decimal: (v, maxDecimals = 2) => {
    let s = String(v).replace(/[^0-9.]/g, '');
    const parts = s.split('.');
    if (parts.length > 2) s = `${parts[0]}.${parts.slice(1).join('')}`;
    if (parts[1]) s = `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
    return s.slice(0, 10);
  },

  integer: v => String(v).replace(/\D/g, '').slice(0, 8),

  email: v => String(v).replace(/[^\w.@+-]/g, '').slice(0, 120),

  otp: v => String(v).replace(/\D/g, '').slice(0, 6),
};

export const validators = {
  name: v => {
    const s = v.trim();
    if (s.length < 2) return 'Name must be at least 2 letters';
    if (!/^[a-zA-Z][a-zA-Z\s'.-]+$/.test(s)) return 'Name can only contain letters';
    return '';
  },
  email: v => {
    const s = v.trim();
    if (!/^\S+@\S+\.\S+$/.test(s)) return 'Enter a valid email';
    return '';
  },
  phone: v => {
    if (v.length < 10) return 'Phone must be at least 10 digits';
    if (!/^\d+$/.test(v)) return 'Phone must contain numbers only';
    return '';
  },
  zip: v => {
    if (v.length < 3) return 'Postcode is too short';
    if (!/^[a-zA-Z0-9\s-]+$/.test(v)) return 'Invalid postcode format';
    return '';
  },
  price: v => {
    if (!v || Number.isNaN(Number(v))) return 'Enter a valid price';
    if (Number(v) <= 0) return 'Price must be greater than 0';
    return '';
  },
  stock: v => {
    if (v === '' || !/^\d+$/.test(v)) return 'Stock must be a whole number';
    return '';
  },
  rating: v => {
    if (v === '') return '';
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 5) return 'Rating must be 0–5';
    return '';
  },
  otp: v => (v.length !== 6 ? 'Enter 6-digit code' : ''),
  description: v => (v.trim().length < 5 ? 'Description must be at least 5 characters' : ''),
};

export const fieldProps = {
  name: { inputMode: 'text', autoComplete: 'name' },
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
  phone: { type: 'tel', inputMode: 'numeric', autoComplete: 'tel' },
  zip: { inputMode: 'text', autoComplete: 'postal-code' },
  city: { inputMode: 'text', autoComplete: 'address-level2' },
  street: { inputMode: 'text', autoComplete: 'street-address' },
  price: { type: 'text', inputMode: 'decimal' },
  stock: { type: 'text', inputMode: 'numeric' },
  rating: { type: 'text', inputMode: 'decimal' },
  otp: { type: 'text', inputMode: 'numeric', maxLength: 6 },
};
