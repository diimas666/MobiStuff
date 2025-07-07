'use client';
import { useCart } from '@/context/CartContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-black transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        Назад до кошика
      </button>

      <h2 className="text-2xl font-bold mb-4">Оформлення замовлення</h2>

      {/* Пример формы */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ім’я</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Телефон</label>
          <input
            type="tel"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Адреса доставки</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            required
          />
        </div>

        <div className="flex justify-between items-center font-bold text-lg">
          <span>Сума до оплати:</span>
          <span className="text-green-600">{total} ₴</span>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Підтвердити замовлення
        </button>
      </form>
    </div>
  );
}
