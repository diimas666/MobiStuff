'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';

/** «Повідомити, коли зʼявиться» — для товарів, яких немає в наявності */
export default function StockAlertForm({ productId }: { productId: string }) {
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    const res = await fetch('/api/stock-alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, contact }) }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setError(d.message || 'Не вдалося підписатися');
      setState('idle');
      return;
    }
    setState('done');
  };

  if (state === 'done') {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-[14px]">
        <Check className="h-5 w-5 text-accent" /> Повідомимо, щойно товар зʼявиться.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-4">
      <p className="flex items-center gap-2 text-[15px] font-medium">
        <Bell className="h-4 w-4 text-accent" /> Повідомити, коли зʼявиться
      </p>
      <div className="mt-3 flex gap-2">
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Телефон або email" aria-label="Телефон або email" className="field h-11" required />
        <button type="submit" disabled={state === 'sending'} className="btn-primary h-11 shrink-0 px-5">
          {state === 'sending' ? '…' : 'Підписатися'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-sale">{error}</p>}
    </form>
  );
}
