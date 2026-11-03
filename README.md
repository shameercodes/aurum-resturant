# Aurum Eats — MERN Food Delivery Platform

Production-style food ordering app (similar to Foodpanda / Uber Eats) built with **MongoDB, Express, React, and Node.js**.

## Features

### Customer
- Browse menu by category (Pizza, Burgers, Drinks, Desserts)
- Search & filter (in-stock)
- Shopping cart (localStorage)
- Checkout with delivery address
- Cash on delivery + mock card payment
- **Email OTP registration** (6-digit code, resend + timer)
- Login only after email verified
- Forgot / reset password via OTP
- Order history & tracking status
- Dark mode
- Responsive Tailwind UI

### Admin
- Dashboard analytics (orders, revenue, users, products)
- Add / delete products (Cloudinary image upload or URL)
- Manage order status
- JWT + role-based access

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Tailwind CSS, React Router, Axios, Context API, React Icons |
| Backend | Node.js, Express, Mongoose |
| Auth | JWT, bcrypt, OTP email (Nodemailer) |
| Storage | MongoDB Atlas, Cloudinary |
| Security | Helmet, CORS, rate limiting |

## Quick start

### 1. Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Gmail App Password (for OTP emails)
- Cloudinary account (optional — can use image URLs)

### 2. Install

```bash
npm run install-all
```

### 3. Configure server

```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, EMAIL_*, CLOUDINARY_*
```

### 4. Run

**Both API and frontend (recommended):**

```bash
# From project root
npm run dev
```

**Or in two terminals:**

```bash
cd server && npm run dev    # API on http://localhost:5000
cd client && npm run dev    # UI on http://localhost:3000
```

The frontend must have the API running on port **5000** or menu/auth data will not load.

- **Frontend:** http://localhost:3000  
- **API:** http://localhost:5000  

On first start, the server auto-seeds **12 products** and an **admin account**.

### Default admin

| Field | Value |
|-------|--------|
| Email | `admin@aurumrestaurant.co.uk` |
| Password | `Aurum@Admin2025` |

Change these in `.env` before production.

## API routes

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/verify-otp` | Public |
| POST | `/api/auth/resend-otp` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET | `/api/products` | Public |
| POST | `/api/orders` | User (JWT) |
| GET | `/api/orders/my` | User |
| GET | `/api/admin/dashboard` | Admin |
| POST | `/api/products` | Admin |

## Project structure

```
aurum-restaurant/
├── client/                 # React + Tailwind
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/        # Auth, Cart, Theme
│       └── pages/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/             # User, Product, Order
│   ├── routes/
│   ├── middleware/
│   └── utils/              # seedProducts, seedAdmin
└── README.md
```

## Email OTP flow

1. User registers → password hashed, OTP generated (10 min expiry)
2. OTP emailed via Nodemailer
3. User enters code on `/verify-otp`
4. `isVerified: true` → JWT issued
5. Login blocked until verified (auto-resends OTP if unverified login attempt)

## Environment variables

See `server/.env.example` for all options including `OTP_EXPIRE_MINUTES`, `APP_NAME`, and email SMTP settings.

## Production notes

- Set strong `JWT_SECRET`
- Configure `ALLOWED_ORIGINS` for CORS
- Use real Stripe keys if replacing mock payment
- Enable Gmail 2FA + App Password for email

## License

MIT
