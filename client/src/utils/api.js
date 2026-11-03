import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_URL?.trim() ||
  (process.env.NODE_ENV === 'production' ? 'http://localhost:5000' : '');

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => Promise.reject(err)
);

api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (err.message === 'Network Error' ? 'Cannot reach the server. Please make sure the server is running on port 5000.' : null) ||
      'Something went wrong. Please try again.';
    err.displayMessage = message;
    return Promise.reject(err);
  }
);

export default api;
