import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPercent } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORY_THUMBS } from '../utils/foodImages';

const CATEGORIES = ['Pizza', 'Burgers', 'Drinks', 'Desserts'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    api.get('/api/products')
      .then(r => {
        setFeatured(r.data.data.slice(0, 8));
        setLoadError(null);
      })
      .catch(err => setLoadError(err.displayMessage || 'Could not load menu'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="relative flex min-h-[85vh] items-center bg-gray-900 text-white">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&h=1080&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          onError={e => {
            e.currentTarget.src = 'https://foodish-api.com/images/burger/burger1.jpg';
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Fast delivery · Fresh food</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
            Crave it. <span className="text-brand-400">Order it.</span> Love it.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-gray-300">
            Pizza, burgers, drinks and desserts — delivered hot to your door in 30 minutes.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/menu" className="btn-primary">Order now <FiArrowRight /></Link>
            <Link to="/register" className="btn-secondary !border-gray-600 !bg-transparent !text-white hover:!border-brand-400">Create account</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white shadow-lg">
          <FiPercent className="shrink-0 text-4xl" />
          <div>
            <h2 className="text-xl font-bold">20% off your first order</h2>
            <p className="text-brand-100">Use code WELCOME20 at checkout</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold">Browse categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              to={`/menu?category=${cat}`}
              className="card group overflow-hidden transition hover:border-brand-500 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={CATEGORY_THUMBS[cat]}
                  alt={cat}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={e => { e.currentTarget.src = CATEGORY_THUMBS.Pizza; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 font-semibold text-white">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Popular dishes</h2>
          <Link to="/menu" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
        </div>
        {loading ? <LoadingSpinner /> : loadError ? (
          <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {loadError}. Start the API with <code className="text-sm">cd server && npm run dev</code> (port 5000).
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
