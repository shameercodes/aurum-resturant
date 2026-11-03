const AppError = require('./AppError');

const PATTERNS = {
  name: /^[a-zA-Z][a-zA-Z\s'.-]{1,59}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10,15}$/,
  zip: /^[a-zA-Z0-9\s-]{3,12}$/,
  otp: /^[0-9]{6}$/,
  text: /^[a-zA-Z0-9\s.,'#/()-]{1,200}$/,
  address: /^[a-zA-Z0-9\s.,'#/-]{2,120}$/,
};

const CATEGORIES = ['Pizza', 'Burgers', 'Drinks', 'Desserts'];

/** Strip non-digits */
const digitsOnly = (val, maxLen = 20) =>
  String(val ?? '').replace(/\D/g, '').slice(0, maxLen);

/** Name: letters, spaces, apostrophe, hyphen */
const sanitizeName = val =>
  String(val ?? '')
    .replace(/[^a-zA-Z\s'.-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 60);

/** General text (no special symbols) */
const sanitizeText = (val, max = 200) =>
  String(val ?? '')
    .replace(/[^a-zA-Z0-9\s.,'#/()-]/g, '')
    .slice(0, max);

/** Address line */
const sanitizeAddress = (val, max = 120) =>
  String(val ?? '')
    .replace(/[^a-zA-Z0-9\s.,'#/-]/g, '')
    .slice(0, max);

const sanitizeZip = val =>
  String(val ?? '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .toUpperCase()
    .slice(0, 12);

const assertString = (val, field, { min = 1, max = 500, pattern = 'text' } = {}) => {
  if (val === undefined || val === null) throw new AppError(`${field} is required`, 400);
  if (typeof val !== 'string') throw new AppError(`${field} must be text`, 400);
  const trimmed = val.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new AppError(`${field} must be ${min}–${max} characters`, 400);
  }
  const regex = PATTERNS[pattern];
  if (regex && !regex.test(trimmed)) {
    throw new AppError(`${field} format is invalid`, 400);
  }
  return trimmed;
};

const parseNumber = (val, field, { min = 0, max = 999999, integer = false } = {}) => {
  if (val === undefined || val === null || val === '') {
    throw new AppError(`${field} is required`, 400);
  }
  const str = String(val).trim();
  if (!integer && !/^-?\d+(\.\d+)?$/.test(str)) {
    throw new AppError(`${field} must be a valid number`, 400);
  }
  if (integer && !/^\d+$/.test(str)) {
    throw new AppError(`${field} must be a whole number`, 400);
  }
  const n = Number(str);
  if (Number.isNaN(n)) throw new AppError(`${field} must be a valid number`, 400);
  if (n < min || n > max) throw new AppError(`${field} must be between ${min} and ${max}`, 400);
  return integer ? Math.floor(n) : n;
};

const validateProductBody = body => ({
  name: assertString(body.name, 'Product name', { min: 2, max: 100, pattern: 'text' }),
  description: assertString(body.description, 'Description', { min: 5, max: 500, pattern: 'text' }),
  category: CATEGORIES.includes(body.category)
    ? body.category
    : (() => { throw new AppError('Invalid category', 400); })(),
  price: parseNumber(body.price, 'Price', { min: 0.01, max: 9999 }),
  stock: parseNumber(body.stock, 'Stock', { min: 0, max: 10000, integer: true }),
  rating: body.rating !== undefined && body.rating !== ''
    ? parseNumber(body.rating, 'Rating', { min: 0, max: 5 })
    : 4.5,
  isActive: !(body.isActive === 'false' || body.isActive === false),
});

const validateAddress = address => {
  if (!address || typeof address !== 'object') throw new AppError('Delivery address is required', 400);
  return {
    street: assertString(address.street, 'Street', { min: 3, max: 120, pattern: 'address' }),
    city: assertString(address.city, 'City', { min: 2, max: 80, pattern: 'text' }),
    zip: assertString(sanitizeZip(address.zip), 'Postcode', { min: 3, max: 12, pattern: 'zip' }),
    phone: assertString(digitsOnly(address.phone, 15), 'Phone', { min: 10, max: 15, pattern: 'phone' }),
    notes: address.notes?.trim()
      ? assertString(address.notes, 'Notes', { min: 1, max: 300, pattern: 'text' })
      : '',
  };
};

module.exports = {
  PATTERNS,
  CATEGORIES,
  digitsOnly,
  sanitizeName,
  sanitizeText,
  sanitizeAddress,
  sanitizeZip,
  assertString,
  parseNumber,
  validateProductBody,
  validateAddress,
};
