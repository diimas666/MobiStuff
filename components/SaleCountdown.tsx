'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

/** Відлік до кінця акції (дата з адмінки, кінець дня за Києвом) */
export default function SaleCountdown({ className = '' }: { className?: string }) {
  const { saleEndsAt } = useStoreSettings();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!saleEndsAt || now === null) return null;
  const end = new Date(`${saleEndsAt}T23:59:59+02:00`).getTime();
  const left = end - now;
  if (!(left > 0)) return null;
  const d = Math.floor(left / 864e5);
  const h = Math.floor((left % 864e5) / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  const s = Math.floor((left % 6e4) / 1e3);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <p className={`inline-flex items-center gap-2 rounded-full bg-sale/[0.08] px-3.5 py-1.5 text-[14px] font-medium text-sale tabular-nums ${className}`} role="timer">
      <Timer className="h-4 w-4" />
      Акція закінчиться через {d > 0 ? `${d} дн ` : ''}
      {pad(h)}:{pad(m)}:{pad(s)}
    </p>
  );
}
