'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { formatPrice } from '@/lib/format';

/** «Купити в 1 клік»: лише телефон — менеджер передзвонить */
export default function QuickOrder({ productId, title, price, variant }: { productId: string; title: string; price: number; variant?: string | null }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const utm = (() => {
        try {
          return JSON.parse(localStorage.getItem('ms_utm') || 'null');
        } catch {
          return null;
        }
      })();
      const res = await fetch('/api/quick-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, phone, name, variant, utm }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Не вдалося надіслати');
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка');
      setState('idle');
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="link-more mx-auto text-[15px]">
        Купити в 1 клік — без оформлення
      </button>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="m-auto w-[calc(100%-32px)] max-w-md rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/40"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[22px] font-semibold tracking-tight">{state === 'done' ? 'Дякуємо!' : 'Купити в 1 клік'}</h2>
            <button type="button" onClick={() => setOpen(false)} className="hdr-icon -mt-1 -mr-2" aria-label="Закрити">
              <X className="h-5 w-5" />
            </button>
          </div>

          {state === 'done' ? (
            <div className="mt-3">
              <p className="flex items-center gap-2 text-[15px] text-ink-2">
                <Check className="h-5 w-5 text-accent" /> Замовлення прийнято. Зателефонуємо протягом 15 хвилин у робочий час.
              </p>
              <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-6 w-full">
                Добре
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-2">
              <p className="text-[14px] text-ink-2">
                {title}
                {variant ? ` · ${variant}` : ''} — <b className="text-ink">{formatPrice(price)}</b>
              </p>
              <p className="mt-1 text-[14px] text-ink-3">Залиште телефон — менеджер передзвонить і оформить доставку.</p>
              <label htmlFor="qo-phone" className="field-label mt-5">Телефон</label>
              <input id="qo-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="099 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} required autoFocus />
              <label htmlFor="qo-name" className="field-label mt-3">Імʼя (необовʼязково)</label>
              <input id="qo-name" className="field" autoComplete="given-name" placeholder="Олена" value={name} onChange={(e) => setName(e.target.value)} />
              {error && <p className="mt-3 text-[14px] text-sale" role="alert">{error}</p>}
              <button type="submit" disabled={state === 'sending'} className="btn-primary mt-5 w-full">
                {state === 'sending' ? 'Надсилаємо…' : 'Замовити'}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
