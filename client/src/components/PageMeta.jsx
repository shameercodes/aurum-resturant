import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Aurum — Michelin-Starred Fine Dining, London',
  '/menu': 'Menu — Aurum Restaurant',
  '/about': 'Our Story — Aurum Restaurant',
  '/gallery': 'Gallery — Aurum Restaurant',
  '/reservations': 'Reservations — Aurum Restaurant',
  '/contact': 'Contact — Aurum Restaurant',
  '/register': 'Create Account — Aurum Restaurant',
  '/account/login': 'Sign In — Aurum Restaurant',
  '/admin/login': 'Admin — Aurum Restaurant',
  '/admin/dashboard': 'Dashboard — Aurum Restaurant',
  '/admin': 'Dashboard — Aurum Restaurant',
};

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const base = pathname.startsWith('/admin') && pathname !== '/admin/login'
      ? 'Dashboard — Aurum Restaurant'
      : TITLES[pathname] || 'Page Not Found — Aurum Restaurant';
    document.title = base;
  }, [pathname]);

  return null;
}
