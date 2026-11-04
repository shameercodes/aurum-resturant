// const isLocalDevOrigin = origin => {
//   try {
//     const { protocol, hostname } = new URL(origin);
//     return (
//       process.env.NODE_ENV !== 'production' &&
//       protocol === 'http:' &&
//       (hostname === 'localhost' || hostname === '127.0.0.1')
//     );
//   } catch {
//     return false;
//   }
// };

// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowed = process.env.ALLOWED_ORIGINS
//       ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
//       : [
//           'http://localhost:3000',
//           'http://127.0.0.1:3000',
//         ];

//     // Allow requests with no origin (mobile apps, curl, Postman in dev)
//     if (!origin) return callback(null, true);

//     if (allowed.includes(origin) || isLocalDevOrigin(origin)) {
//       return callback(null, true);
//     }
//     callback(new Error(`CORS policy: origin "${origin}" is not allowed`));
//   },
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// module.exports = corsOptions;

const allowedOrigins = [
  "https://aurum-resturant.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked CORS origin:", origin);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;