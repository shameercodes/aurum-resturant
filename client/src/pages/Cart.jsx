import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import FoodImage from '../components/FoodImage';

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-xl font-semibold text-gray-500">Your cart is empty</p>
        <Link to="/menu" className="btn-primary mt-6 inline-flex">Browse menu</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <button type="button" onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear all</button>
      </div>
      <ul className="mt-8 space-y-4">
        {items.map(item => (
          <li key={item._id} className="card flex gap-4 p-4">
            <FoodImage product={item} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between">
                <h3 className="font-semibold">{item.name}</h3>
                <span className="font-bold text-brand-600">£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">£{item.price.toFixed(2)} each</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => updateQty(item._id, -1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><FiMinus /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item._id, 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><FiPlus /></button>
                </div>
                <button type="button" onClick={() => removeItem(item._id)} className="text-red-500 hover:text-red-600"><FiTrash2 /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="card mt-8 p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-brand-600">£{total.toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to checkout</Link>
      </div>
    </div>
  );
}
