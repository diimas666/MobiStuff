'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { ReviewSummary } from '@/lib/reviews';

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} з 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-line text-line'}`} strokeWidth={0} />
      ))}
    </span>
  );
}

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'відгук' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'відгуки' : 'відгуків');

/** Відгуки покупців + форма нового відгуку (публікується після перевірки) */
export default function ProductReviews({ handle, summary, orderId, token }: { handle: string; summary: ReviewSummary; orderId?: string; token?: string }) {
  const [open, setOpen] = useState(Boolean(orderId));
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle, rating, name, text, orderId, token }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) {
      setError(d.error || 'Не вдалося надіслати');
      setState('idle');
      return;
    }
    setState('done');
  };

  const list = showAll ? summary.reviews : summary.reviews.slice(0, 4);

  return (
    <section id="reviews" className={orderId ? 'mt-2' : 'mt-20 scroll-mt-24 sm:mt-28'}>
      {!orderId && (
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">Відгуки</h2>
          {summary.count ? (
            <p className="mt-2 flex items-center gap-2 text-[15px] text-ink-2">
              <Stars value={summary.average} /> {summary.average.toFixed(1)} · {summary.count} {plural(summary.count)}
            </p>
          ) : (
            <p className="mt-2 text-[15px] text-ink-2">Ще немає відгуків — будьте першим.</p>
          )}
        </div>
        {!open && state !== 'done' && (
          <button type="button" onClick={() => setOpen(true)} className="btn-ghost h-11 px-5">Написати відгук</button>
        )}
      </div>
      )}

      {state === 'done' ? (
        <p className="panel mt-6 p-6 text-[15px]">Дякуємо! Відгук зʼявиться після перевірки.</p>
      ) : open ? (
        <form onSubmit={submit} className="panel mt-6 max-w-xl space-y-4 p-6">
          {orderId ? <p className="text-[14px] text-accent">Покупку підтверджено — ваш відгук буде позначено.</p> : null}
          <div>
            <p className="field-label">Ваша оцінка</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" aria-label={`${i} з 5`} onClick={() => setRating(i)} className="p-1">
                  <Star className={`h-8 w-8 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-line text-line'}`} strokeWidth={0} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="rv-name" className="field-label">Імʼя</label>
            <input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="field" placeholder="Олена" />
          </div>
          <div>
            <label htmlFor="rv-text" className="field-label">Відгук</label>
            <textarea id="rv-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={4} className="field" placeholder="Що сподобалось, чи підійшло до телефону…" />
          </div>
          {error && <p className="text-[14px] text-sale" role="alert">{error}</p>}
          <button type="submit" disabled={!rating || state === 'sending'} className="btn-primary h-11 px-6">{state === 'sending' ? 'Надсилаємо…' : 'Надіслати відгук'}</button>
        </form>
      ) : null}

      {list.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="panel p-5">
              <div className="flex items-center justify-between gap-2">
                <Stars value={r.rating} />
                <span className="text-[12px] text-ink-3">{new Date(r.createdAt).toLocaleDateString('uk-UA')}</span>
              </div>
              <p className="mt-2 text-[15px] font-medium">
                {r.name}
                {r.verified ? <span className="ml-2 text-[12px] font-normal text-accent">✓ Покупка підтверджена</span> : null}
              </p>
              {r.text ? <p className="mt-1 whitespace-pre-line text-[15px] text-ink-2">{r.text}</p> : null}
              {r.reply ? (
                <p className="mt-3 rounded-2xl bg-canvas p-3 text-[14px] text-ink-2">
                  <span className="font-medium text-ink">MobiStuff: </span>
                  {r.reply}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {summary.reviews.length > 4 && !showAll && (
        <button type="button" onClick={() => setShowAll(true)} className="link-more mt-4 text-[15px]">Показати всі {summary.count}</button>
      )}
    </section>
  );
}
