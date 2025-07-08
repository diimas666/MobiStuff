'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(true); // 🟢 отслеживаем, отправлен ли заказ

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
      })
        .catch((error) => {
          console.error('❌ Помилка збереження замовлення:', error);
        })
        .finally(() => {
          setIsSaving(false); // ✅ только после этого показываем страницу
        });
    } else {
      setIsSaving(false); // если нет заказа
    }
  }, []);

  useEffect(() => {
    if (!isSaving) {
      const timeout = setTimeout(() => {
        router.push('/');
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [isSaving, router]);

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
          <strong>Оплата:</strong>{' '}
          {order.paymentMethod === 'card' ? 'Карткою' : 'При отриманні'}
        </p>
        <p>
          <strong>Сума:</strong> {order.total} ₴
        </p>
      </div>
    </div>
  );
}
