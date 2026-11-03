import axios from 'axios';

// In dev, empty baseURL uses the CRA proxy (client/package.json → localhost:5000).
const baseURL =
  process.env.REACT_APP_API_URL?.trim() ||
  (process.env.NODE_ENV === "production"
    ? "https://aurum-resturant.onrender.com"
    : "");

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out' : null) ||
      (err.message === 'Network Error' ? 'Cannot reach server. Is the API running on port 5000?' : null) ||
      'Something went wrong';
    err.displayMessage = message;
    return Promise.reject(err);
  }
);

export default api;
