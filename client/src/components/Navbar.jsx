import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingBag, FiMenu, FiX, FiChevronDown,
  FiUser, FiLogIn, FiLogOut, FiSun, FiMoon,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
];

function LogoMark() {
  return (
    <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded-t-[1.1rem] rounded-b-md border-2 border-neutral-900 bg-white text-neutral-900 dark:border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M11 2v9.5c0 .8-.7 1.5-1.5 1.5S8 12.3 8 11.5V2H6v9.5c0 1.9 1.6 3.5 3.5 3.5.5 0 1 .1 1.5.3V22h2v-6.7c.5-.2 1-.3 1.5-.3 1.9 0 3.5-1.6 3.5-3.5V2h-2z" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pagesRef = useRef(null);
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
    setPagesOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = e => {
      if (pagesRef.current && !pagesRef.current.contains(e.target)) setPagesOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-[15px] font-medium tracking-wide transition-colors ${
      isActive
        ? 'text-neutral-900 dark:text-white'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
    }`;

  const submitSearch = e => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/menu?search=${encodeURIComponent(q)}` : '/menu');
    setSearchOpen(false);
    setQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const otherPages = [
    { to: '/contact', label: 'Contact', show: true },
    { to: '/profile', label: 'My account', show: !!user },
    { to: '/admin', label: 'Admin dashboard', show: isAdmin },
    { to: '/login', label: 'Sign in', show: !user },
    { to: '/register', label: 'Register', show: !user },
  ].filter(x => x.show);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex h-[72px] items-center justify-between gap-6">
          {/* Logo — Foores style */}
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <LogoMark />
            <span className="hidden leading-none sm:block">
              <span className="block text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                AURUM
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
                Restaurant
              </span>
            </span>
          </Link>

          {/* Center navigation — desktop */}
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}

            <div className="relative" ref={pagesRef}>
              <button
                type="button"
                onClick={() => setPagesOpen(v => !v)}
                className="flex items-center gap-1 text-[15px] font-medium tracking-wide text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Other Pages
                <FiChevronDown className={`text-sm transition ${pagesOpen ? 'rotate-180' : ''}`} />
              </button>
              {pagesOpen && (
                <div className="absolute left-0 top-full z-50 mt-3 min-w-[200px] rounded-md border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                  {otherPages.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="block px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {label}
                    </Link>
                  ))}
                  {user && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-neutral-100 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-950/30"
                    >
                      <FiLogOut /> Sign out
                    </button>
                  )}
                </div>
              )}
            </div>

            <NavLink to="/menu" className={linkClass}>
              Shop
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/menu"
              className="nav-btn-reserve hidden sm:inline-flex"
            >
              Order now
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(v => !v)}
              className="rounded-md p-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Search menu"
            >
              <FiSearch className="text-xl stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={toggle}
              className="rounded-md p-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-amber-400 dark:hover:bg-neutral-800"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <FiSun className="text-xl stroke-[1.5]" /> : <FiMoon className="text-xl stroke-[1.5]" />}
            </button>

            <Link
              to="/cart"
              className="relative rounded-md p-2 text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label={`Cart, ${count} items`}
            >
              <FiShoppingBag className="text-xl stroke-[1.5]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/profile"
                  className="rounded-md p-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  title={user.name}
                >
                  <FiUser className="text-xl stroke-[1.5]" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <FiLogOut className="text-base" />
                  <span className="hidden lg:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 md:inline-flex dark:border-neutral-700 dark:text-neutral-300"
              >
                <FiLogIn /> Sign in
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="rounded-md p-2 text-neutral-800 lg:hidden dark:text-neutral-200"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Expandable search bar */}
        <div
          className={`overflow-hidden border-t border-neutral-100 transition-all duration-300 dark:border-neutral-800 ${
            searchOpen ? 'max-h-20 pb-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <form onSubmit={submitSearch} className="relative pt-3">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 mt-1.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full rounded-md border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900"
              autoFocus={searchOpen}
            />
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`border-t border-neutral-200 bg-white transition-all duration-300 lg:hidden dark:border-neutral-800 dark:bg-neutral-950 ${
          mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <nav className="mx-auto max-w-7xl space-y-1 px-5 py-4 sm:px-8">
          {[...NAV_LINKS, { to: '/menu', label: 'Shop' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => (
            <NavLink
              key={`${to}-${label}`}
              to={to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-[15px] font-medium ${
                  isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-neutral-600">
              Admin
            </NavLink>
          )}
          <Link to="/menu" className="nav-btn-reserve mt-3 w-full justify-center">
            Order now
          </Link>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium text-neutral-700">Profile</Link>
                <button type="button" onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-red-600">
                  <FiLogOut /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-neutral-700">
                  <FiLogIn /> Sign in
                </Link>
                <Link to="/register" className="text-sm font-medium text-neutral-900">Register</Link>
              </>
            )}
            <button type="button" onClick={toggle} className="rounded-md p-2 text-neutral-600" aria-label="Toggle theme">
              {dark ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
