'use client';

import Link from 'next/link';
import AppStoreButton from '@/components/app/AppStoreButton';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { trackPurchase } from '@/lib/analytics';
import { CartItem } from '@/context/CartContext';

const REDIRECT_SECONDS = 15;

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
      // Замовлення вже збережене сервером у /api/checkout — тут лише показуємо підсумок
      setOrder(parsed);
      setIsSaving(false);
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
      orderId: typeof order.orderId === 'string' ? order.orderId : undefined,
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-ink-3" />
        <p className="text-[15px] text-ink-2">Оформлюємо замовлення…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8 text-center sm:py-16">
      <svg viewBox="0 0 80 80" className="mx-auto mb-8 h-20 w-20 text-accent" aria-hidden>
        <circle className="draw-circle" cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
        <path className="draw-check" d="M25 41 l10 10 l20 -22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <h1 className="display-lg rise" style={{ '--d': '300ms' } as React.CSSProperties}>
        Дякуємо! Замовлення прийнято.
      </h1>
      <p className="lead rise mt-4" style={{ '--d': '420ms' } as React.CSSProperties}>
        Зателефонуємо найближчим часом, щоб підтвердити деталі. Відправляємо Новою Поштою за 1–3 дні.
      </p>

      <dl className="panel rise mt-10 divide-y divide-line-soft px-6 text-left text-[15px]" style={{ '--d': '540ms' } as React.CSSProperties}>
        {typeof order.orderId === 'string' && order.orderId ? (
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-ink-2">Номер замовлення</dt>
            <dd className="font-semibold tabular-nums">{order.orderId}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-ink-2">Сума</dt>
          <dd className="font-semibold">{formatPrice(order.total)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="shrink-0 text-ink-2">Місто</dt>
          <dd className="text-right">{order.city}</dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="shrink-0 text-ink-2">Відділення</dt>
          <dd className="line-clamp-2 text-right">{order.warehouse}</dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="shrink-0 text-ink-2">Оплата</dt>
          <dd className="text-right">{order.paymentMethod === 'card' ? 'Карткою' : 'При отриманні'}</dd>
        </div>
      </dl>

      <Link href="/" className="btn-primary btn-lg mt-8">
        Продовжити покупки
      </Link>
      <p className="mt-4 text-[13px] text-ink-3">Повернемося на головну через {secondsLeft} с</p>

      <div className="mt-10 flex w-full max-w-md flex-col items-center rounded-3xl bg-white p-6 text-center">
        <p className="text-[17px] font-semibold tracking-tight">Стежте за посилкою в застосунку</p>
        <p className="mt-1 mb-4 text-[14px] text-ink-2">Статус і номер ТТН прийдуть сповіщенням — без дзвінків.</p>
        <AppStoreButton source="thank-you" />
      </div>
    </div>
  );
}
