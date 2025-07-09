'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');
    if (!stored) {
      setIsSaving(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setOrder(parsed);

      // Сохраняем заказ в MongoDB
      fetch('/api/saveOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
        .catch((err) => {
          console.error('❌ Помилка збереження замовлення:', err);
        })
        .finally(() => setIsSaving(false));

      // 👇 защита от повторной отправки
      const alreadySent = localStorage.getItem('emailSent') === 'true';
      if (parsed.email && !alreadySent) {
        fetch('/api/sendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        })
          .then((res) => {
            if (res.ok) {
              setEmailSent(true);
              localStorage.setItem('emailSent', 'true'); // ✅ фіксація
            } else {
              console.error('❌ Email не надіслано');
            }
          })
          .catch((err) => console.error('❌ Email помилка:', err));
      }
    } catch (err) {
      console.error('❌ JSON parse error:', err);
      setIsSaving(false);
    }
  }, []);

  if (isSaving || !order) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
        <p className="text-gray-600">Завантаження замовлення...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        ✅ Дякуємо за замовлення!
      </h1>
      <p className="mb-4 text-center">
        Ваше замовлення прийнято та обробляється.
        {emailSent && (
          <span className="block text-green-600 mt-2">
            📧 Підтвердження надіслано на {order.email}
          </span>
        )}
      </p>

      <div className="bg-gray-100 p-4 rounded space-y-2 text-sm">
        <p>
          <strong>Ім’я:</strong> {order.name} {order.lastName}
        </p>
        <p>
          <strong>Телефон:</strong> {order.phone}
        </p>
        <p>
          <strong>Місто:</strong> {order.city}
        </p>
        <p>
          <strong>Відділення:</strong> {order.warehouse}
        </p>
        <p>
          <strong>Оплата:</strong>{' '}
          {order.paymentMethod === 'card' ? 'Карткою' : 'При отриманні'}
        </p>
        <p>
          <strong>Сума:</strong> {order.total} ₴
        </p>
        {order.comment && (
          <p>
            <strong>Коментар:</strong> {order.comment}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push('/')}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition cursor-pointer"
        >
          На головну
        </button>
      </div>
    </div>
  );
}
