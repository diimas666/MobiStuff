'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { trackPurchase } from '@/lib/analytics';
import { CartItem } from '@/context/CartContext';

const REDIRECT_SECONDS = 5;

export default function ThankYouPage() {
  const router = useRouter();
  const [order, setOrder] = useState<{
    total?: number;
    city?: string;
    warehouse?: string;
    phone?: string;
    paymentMethod?: string;
    createdAt?: string;
    items?: CartItem[];
    [key: string]: unknown;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');

    if (!stored) {
      setIsSaving(false);
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setOrder(parsed);

      fetch('/api/saveOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
        .catch((err) => {
          console.error('❌ Помилка збереження замовлення:', err);
        })
        .finally(() => setIsSaving(false));
    } catch (err) {
      console.error('❌ JSON parse error:', err);
      setIsSaving(false);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (!order || purchaseTrackedRef.current || typeof order.total !== 'number') return;
    purchaseTrackedRef.current = true;
    trackPurchase({
      createdAt: order.createdAt,
      phone: order.phone,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
    });
  }, [order]);

  useEffect(() => {
    if (isSaving || !order) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSaving, order]);

  useEffect(() => {
    if (isSaving || !order || secondsLeft > 0) return;
    router.replace('/');
  }, [isSaving, order, secondsLeft, router]);

  if (isSaving || !order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-gray-500 text-sm">Обробка замовлення...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 flex justify-center">
      <div className="w-full max-w-lg">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.75} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Замовлення оформлено!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-2">
            Дякуємо, що обрали MobiStuff. Ваше замовлення прийнято та незабаром буде оброблене.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Дякуємо, що користуєтесь нашим асортиментом — сподіваємось побачити вас знову!
          </p>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-left text-sm space-y-2 mb-6">
            <p>
              <span className="text-gray-500">Сума:</span>{' '}
              <strong className="text-green-600">{order.total} грн</strong>
            </p>
            <p>
              <span className="text-gray-500">Доставка:</span> {order.city}
            </p>
            <p className="line-clamp-2">
              <span className="text-gray-500">Відділення:</span> {order.warehouse}
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Перехід на головну через {secondsLeft} сек…
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            На головну зараз
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
