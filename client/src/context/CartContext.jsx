import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = product => {
    setItems(prev => {
      const i = prev.findIndex(x => x._id === product._id);
      if (i >= 0) {
        const next = [...prev];
        if (next[i].quantity < product.stock) next[i].quantity += 1;
        return next;
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: 1,
      }];
    });
  };

  const updateQty = (id, delta) => {
    setItems(prev => prev.map(item => {
      if (item._id !== id) return item;
      const q = Math.max(1, Math.min(item.stock, item.quantity + delta));
      return { ...item, quantity: q };
    }));
  };

  const removeItem = id => setItems(prev => prev.filter(i => i._id !== id));
  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
