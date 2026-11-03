import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATS = ['all', 'Pizza', 'Burgers', 'Drinks', 'Desserts'];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) setCategory(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    if (inStockOnly) params.set('inStock', 'true');
    api.get(`/api/products?${params}`)
      .then(r => {
        setProducts(r.data.data);
        setLoadError(null);
      })
      .catch(err => {
        setProducts([]);
        setLoadError(err.displayMessage || 'Could not load menu');
      })
      .finally(() => setLoading(false));
  }, [category, search, inStockOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Our Menu</h1>
      <p className="mt-2 text-gray-500">Search, filter and add to cart</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-11"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded text-brand-500" />
          In stock only
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => { setCategory(c); setSearchParams(c === 'all' ? {} : { category: c }); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === c ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : loadError ? (
        <p className="py-16 text-center text-red-600 dark:text-red-400">
          {loadError}. Start the API with <code className="text-sm">cd server && npm run dev</code>.
        </p>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No items found.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
