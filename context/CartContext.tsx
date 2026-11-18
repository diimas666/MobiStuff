// app/context/CartContext.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/interface/product';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';

export interface CartItem extends Product {
  quantity: number;
}
interface CartContextProps {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  /** true, коли кошик уже прочитано з localStorage */
  isReady: boolean;
}

const CartContext = createContext<CartContextProps | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // пошкоджені дані — починаємо з порожнього кошика
    }
    setIsReady(true);
  }, []);
  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, isReady]);

  const addToCart = (product: Product) => {
    // ✅ Проверка, что всё нужное есть
    if (!product._id) {
      console.warn(
        '❌ Товар не добавлен в корзину — отсутствует _id:',
        product
      );
      return;
    }

    if (!product.image) {
      console.warn('🟡 Товар без изображения:', product.title);
    }

    // ✅ Безопасная обработка
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        console.log('🔁 Увеличиваем количество:', product.title);
        trackAddToCart(product, 1);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newItem = {
        ...product,
        image: product.image?.replace(/"/g, '').trim() || '/no-image.png',
        quantity: 1,
      };

      trackAddToCart(newItem, 1);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const item = prev.find((entry) => entry._id === id);
      if (item) trackRemoveFromCart(item, item.quantity);
      return prev.filter((entry) => entry._id !== id);
    });
  };
  const increment = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };
  const decrement = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decrement,
        increment,
        clearCart,
        isReady,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
