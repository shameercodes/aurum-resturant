import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const persist = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await api.post('/api/auth/verify-otp', { email, otp });
    persist(data.token, data.user);
    return data;
  };

  const resendOtp = async email => {
    const { data } = await api.post('/api/auth/resend-otp', { email });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    persist(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = email => api.post('/api/auth/forgot-password', { email });
  const resetPassword = (email, otp, password) =>
    api.post('/api/auth/reset-password', { email, otp, password }).then(({ data }) => {
      persist(data.token, data.user);
      return data;
    });

  return (
    <AuthContext.Provider value={{
      user, loading, register, verifyOtp, resendOtp, login, logout,
      forgotPassword, resetPassword, isAdmin: user?.role === 'admin',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
