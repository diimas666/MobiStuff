'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MapPin, Package, Truck } from 'lucide-react';

type Status = {
  number: string;
  status: string;
  statusCode: number;
  citySender?: string;
  cityRecipient?: string;
  warehouseRecipient?: string;
  scheduledDeliveryDate?: string;
  actualDeliveryDate?: string;
};

// Коди статусів Нової Пошти → етап
const stage = (code: number) => (code === 9 || code === 10 || code === 11 ? 3 : code === 7 || code === 8 ? 2 : code >= 4 && code <= 6 ? 1 : 0);
const STEPS = [
  { icon: Package, label: 'Створено' },
  { icon: Truck, label: 'В дорозі' },
  { icon: MapPin, label: 'У відділенні' },
  { icon: CheckCircle2, label: 'Отримано' },
];

export default function TrackingForm() {
  const params = useSearchParams();
  const [ttn, setTtn] = useState(params.get('ttn') ?? '');
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    const res = await fetch(`/api/tracking?ttn=${encodeURIComponent(ttn)}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    setLoading(false);
    if (!res?.ok) return setError(d.error || 'Не вдалося перевірити');
    setData(d);
  };

  useEffect(() => {
    if (params.get('ttn')) track();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = data ? stage(data.statusCode) : -1;

  return (
    <>
      <form onSubmit={track} className="panel mt-8 grid gap-3 p-5 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <div>
          <label htmlFor="tr-ttn" className="field-label">Номер ТТН</label>
          <input id="tr-ttn" className="field font-medium tracking-wide" inputMode="numeric" value={ttn} onChange={(e) => setTtn(e.target.value)} placeholder="20450012345678" required />
        </div>
        <div>
          <label htmlFor="tr-phone" className="field-label">Телефон (необовʼязково)</label>
          <input id="tr-phone" className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Для адреси відділення" />
        </div>
        <button type="submit" className="btn-primary h-[52px]" disabled={loading}>
          {loading ? 'Шукаємо…' : 'Відстежити'}
        </button>
      </form>

      {error && <p className="mt-5 rounded-2xl bg-sale/[0.06] px-4 py-3 text-[15px] text-sale" role="alert">{error}</p>}

      {data && (
        <section className="panel mt-6 p-6" aria-live="polite">
          <p className="text-[13px] text-ink-3">ТТН {data.number}</p>
          <p className="mt-1 text-[22px] font-semibold tracking-tight">{data.status}</p>
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i <= current;
              return (
                <li key={s.label} className="flex flex-col items-center text-center">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full ${done ? 'bg-accent text-white' : 'bg-canvas text-ink-3'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={`mt-2 text-[12px] ${done ? 'font-medium text-ink' : 'text-ink-3'}`}>{s.label}</span>
                </li>
              );
            })}
          </ol>
          <dl className="mt-6 space-y-2 text-[15px]">
            {data.cityRecipient && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Куди</dt>
                <dd className="text-right">{data.cityRecipient}{data.warehouseRecipient ? `, ${data.warehouseRecipient}` : ''}</dd>
              </div>
            )}
            {(data.actualDeliveryDate || data.scheduledDeliveryDate) && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">{data.actualDeliveryDate ? 'Доставлено' : 'Очікувана доставка'}</dt>
                <dd>{data.actualDeliveryDate || data.scheduledDeliveryDate}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </>
  );
}
