import { FiStar, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import FoodImage from './FoodImage';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <article className="card group overflow-hidden transition hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <FoodImage
          product={product}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
            Out of stock
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium dark:bg-gray-900/90">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
          <span className="font-bold text-brand-600">£{product.price.toFixed(2)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-amber-500">
            <FiStar className="fill-current" /> {product.rating?.toFixed(1)}
          </span>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addItem(product)}
            className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
