'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, increment, decrement, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">🛒 Ваш кошик</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">У кошику немає товарів.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border p-4 rounded-xl shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {item.image ? (
                  <div className="relative w-30 h-20 mx-auto sm:mx-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      priority
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    Нема фото
                  </div>
                )}
                <div>
                  <p className="font-medium line-clamp-2 max-w-[240px]">
                    {item.title}
                  </p>
                  <p className="text-xl text-green-500">{item.price} ₴</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => decrement(item._id!)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"
                >
                  −
                </button>
                <span className="min-w-[24px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increment(item._id!)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item._id!)}
                  className="text-red-500 hover:underline text-sm cursor-pointer hover:bg-gray-100 px-3 py-1 rounded"
                >
                  {''}
                  <Trash2 size={28} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="text-xl font-bold">Сума:</span>
            <span className="text-xl font-bold text-green-600">{total} ₴</span>
          </div>

          <button
            onClick={() => {
              router.push('checkout');
            }}
            className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            Оформити замовлення
          </button>
        </div>
      )}
    </div>
  );
}
