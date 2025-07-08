'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  // Загружаем заказ из localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');
    if (stored) {
      const parsed = JSON.parse(stored);
      setOrder(parsed);

      // Отправляем заказ в MongoDB
      fetch('/api/saveOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      }).catch((error) => {
        console.error('❌ Помилка збереження замовлення:', error);
      });
    }
  }, []);

  // Редирект через 5 секунд
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timeout);
  }, [router]);

  if (!order)
    return <p className="text-center mt-10">Завантаження замовлення...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Дякуємо за замовлення!</h1>
      <p className="mb-4">Ваше замовлення було прийнято та обробляється.</p>
      <div className="bg-gray-100 p-4 rounded">
        <p>
          <strong>Ім’я:</strong> {order.name}
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
          <strong>Сума:</strong> {order.total} ₴
        </p>
      </div>
    </div>
  );
}
