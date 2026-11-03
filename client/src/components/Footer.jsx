import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900 text-gray-300 dark:border-gray-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <h3 className="text-lg font-bold text-brand-400">Aurum Eats</h3>
          <p className="mt-3 text-sm text-gray-400">Fresh food delivered to your door. Order online in minutes.</p>
          <div className="mt-4 flex gap-3">
            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
              <a key={i} href="#" className="rounded-lg border border-gray-700 p-2 hover:border-brand-500 hover:text-brand-400" aria-label="Social">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white">Quick links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {['/', '/menu', '/cart', '/contact'].map((path, i) => (
              <li key={path}><Link to={path} className="hover:text-brand-400">{['Home', 'Menu', 'Cart', 'Contact'][i]}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Opening hours</h4>
          <ul className="mt-3 space-y-1 text-sm text-gray-400">
            <li>Mon – Thu: 11:00 – 23:00</li>
            <li>Fri – Sat: 11:00 – 00:00</li>
            <li>Sunday: 12:00 – 22:00</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-3 text-sm text-gray-400">14 Golden Square, London</p>
          <p className="text-sm">+44 20 7946 0823</p>
          <p className="text-sm">hello@aurumeats.co.uk</p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Aurum Eats. All rights reserved.
      </div>
    </footer>
  );
}
