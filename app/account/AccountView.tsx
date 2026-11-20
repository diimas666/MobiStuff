'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LogOut, RotateCcw, Star, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatPrice } from '@/lib/format';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orderStatus';

type Item = { _id: string; handle: string; title: string; image?: string; price: number; quantity: number };
type Order = { orderId: string; status: OrderStatus; total: number; items: Item[]; createdAt: string; city?: string; warehouse?: string; ttn?: string };
type Me = { loggedIn: boolean; phone?: string; balance?: number; history?: { at: string; delta: number; reason: string }[]; orders?: Order[] };

/** Кабінет: вхід кодом з SMS, замовлення, «Повторити», бали кешбеку */
export default function AccountView() {
  const [me, setMe] = useState<Me | null>(null);
  const load = () =>
    fetch('/api/account/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ loggedIn: false }));

  useEffect(() => {
    load();
  }, []);

  if (!me) return <div className="min-h-[50vh]" aria-busy="true" />;
  return me.loggedIn ? <Dashboard me={me} onLogout={load} /> : <Login onDone={load} />;
}

function Login({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await fetch('/api/orders/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r?.ok) return setError(d.error || 'Не вдалося надіслати код');
    setStep('code');
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await fetch('/api/account/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r?.ok) return setError(d.error || 'Невірний код');
    onDone();
  };

  return (
    <div className="mx-auto max-w-md py-10 sm:py-16">
      <h1 className="display-lg">Мій кабінет.</h1>
      <p className="lead mt-3">Замовлення, статуси доставки й бали кешбеку — за номером телефону.</p>
      {step === 'phone' ? (
        <form onSubmit={request} className="panel mt-8 p-6">
          <label htmlFor="ac-phone" className="field-label">Номер телефону</label>
          <input id="ac-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="099 123 45 67" required autoFocus />
          <p className="mt-2 text-[13px] text-ink-3">Надішлемо код у SMS. Код приходить на номери, з яких уже були замовлення.</p>
          {error && <p className="mt-3 text-[14px] text-sale" role="alert">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={busy}>{busy ? 'Надсилаємо…' : 'Отримати код'}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="panel mt-8 p-6">
          <label htmlFor="ac-code" className="field-label">Код з SMS на {phone}</label>
          <input id="ac-code" className="field text-center text-[22px] font-semibold tracking-[0.4em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" required autoFocus />
          {error && <p className="mt-3 text-[14px] text-sale" role="alert">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={busy || code.length !== 6}>{busy ? 'Перевіряємо…' : 'Увійти'}</button>
          <button type="button" onClick={() => setStep('phone')} className="link-more mx-auto mt-4 flex text-[14px]">Змінити номер</button>
        </form>
      )}
    </div>
  );
}

function Dashboard({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { cashbackPercent = 3, maxPointsPercent = 30 } = useStoreSettings();

  const repeat = (o: Order) => {
    o.items.forEach((i) => {
      for (let n = 0; n < (i.quantity || 1); n++) addToCart({ ...i, _id: String(i._id) } as never);
    });
    toast.success('Товари додано в кошик');
    router.push('/cart');
  };

  const logout = async () => {
    await fetch('/api/account/login', { method: 'DELETE' });
    onLogout();
  };

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg">Мій кабінет.</h1>
          <p className="mt-2 text-[15px] text-ink-2">{me.phone}</p>
        </div>
        <button type="button" onClick={logout} className="btn-ghost h-10 px-4 text-[14px]">
          <LogOut className="h-4 w-4" /> Вийти
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl bg-ink p-6 text-white">
          <p className="flex items-center gap-2 text-[14px] text-white/70"><Star className="h-4 w-4" /> Бали кешбеку</p>
          <p className="mt-2 text-[44px] leading-none font-semibold tracking-tight">{me.balance ?? 0}</p>
          <p className="mt-3 text-[14px] text-white/70">
            1 бал = 1 ₴. Повертаємо {cashbackPercent}% з кожного виконаного замовлення. Балами можна оплатити до {maxPointsPercent}% наступного.
          </p>
        </div>
        <div className="panel p-6">
          <p className="text-[17px] font-semibold">Історія балів</p>
          {me.history?.length ? (
            <ul className="mt-3 space-y-2 text-[14px]">
              {me.history.slice(0, 6).map((h, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-ink-2">{new Date(h.at).toLocaleDateString('uk-UA')} · {h.reason}</span>
                  <span className={`font-semibold ${h.delta > 0 ? 'text-accent' : 'text-ink'}`}>{h.delta > 0 ? '+' : ''}{h.delta}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-ink-3">Бали зʼявляться після першого виконаного замовлення.</p>
          )}
        </div>
      </section>

      <h2 className="mt-12 mb-4 text-[24px] font-semibold tracking-tight">Мої замовлення</h2>
      {!me.orders?.length ? (
        <div className="panel px-6 py-12 text-center">
          <p className="text-[17px] font-semibold">Замовлень ще немає</p>
          <Link href="/catalog" className="btn-primary mt-5">Перейти до каталогу</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {me.orders.map((o) => {
            const c = ORDER_STATUS_COLORS[o.status];
            return (
              <li key={o.orderId} className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[16px] font-semibold">{o.orderId}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                </div>
                <p className="mt-1 text-[13px] text-ink-3">
                  {new Date(o.createdAt).toLocaleDateString('uk-UA')} · {o.items.length} {o.items.length === 1 ? 'товар' : 'товари'} · {formatPrice(o.total)}
                </p>
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {o.items.map((i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i.handle} src={i.image || '/images/headphones-bg-white.webp'} alt={i.title} title={i.title} className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1" />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.ttn && (
                    <Link href={`/tracking?ttn=${o.ttn}`} className="chip gap-1.5"><Truck className="h-4 w-4" /> Відстежити {o.ttn}</Link>
                  )}
                  <button type="button" onClick={() => repeat(o)} className="chip gap-1.5"><RotateCcw className="h-4 w-4" /> Повторити замовлення</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
