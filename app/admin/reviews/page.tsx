'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminWrapper from '@/components/AdminWrapper';

type R = { _id: string; handle: string; productTitle: string; name: string; rating: number; text: string; status: string; verified?: boolean; reply?: string; source?: string; createdAt: string };
const TABS = [
  { key: 'pending', label: 'На перевірці' },
  { key: 'approved', label: 'Опубліковані' },
  { key: 'rejected', label: 'Відхилені' },
] as const;

/** Модерація відгуків: схвалити, відхилити, відповісти від магазину */
export default function ReviewsAdmin() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('pending');
  const [list, setList] = useState<R[] | null>(null);
  const [pending, setPending] = useState(0);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const load = () => {
    setList(null);
    fetch(`/api/admin/reviews?status=${tab}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setList(d.reviews ?? []);
        setPending(d.pending ?? 0);
      })
      .catch(() => setList([]));
  };
  useEffect(load, [tab]);

  const patch = async (id: string, data: Record<string, unknown>, msg: string) => {
    const r = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
    if (!r.ok) return toast.error('Не вдалося');
    toast.success(msg);
    load();
  };

  return (
    <AdminWrapper>
      <div className="space-y-5 pb-16">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Відгуки</h2>
          <p className="text-[14px] text-ink-3">Відгук зʼявляється на сайті й у застосунку після схвалення. «Покупка підтверджена» — залишено за посиланням із замовлення.</p>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`chip ${tab === t.key ? 'bg-ink text-white' : ''}`}>
              {t.label}
              {t.key === 'pending' && pending ? ` (${pending})` : ''}
            </button>
          ))}
        </div>
        {!list ? (
          <p className="panel px-5 py-10 text-center text-ink-3">Завантаження…</p>
        ) : !list.length ? (
          <p className="panel px-5 py-10 text-center text-ink-3">Тут порожньо</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r._id} className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={`/product/${r.handle}`} target="_blank" className="text-[14px] text-ink-2 hover:underline">{r.productTitle}</a>
                  <span className="text-[12px] text-ink-3">{new Date(r.createdAt).toLocaleString('uk-UA')} · {r.source === 'app' ? 'застосунок' : 'сайт'}</span>
                </div>
                <p className="mt-2 text-[18px] tracking-wider text-amber-500">{'★'.repeat(r.rating)}<span className="text-line">{'★'.repeat(5 - r.rating)}</span></p>
                <p className="mt-1 font-medium">
                  {r.name}
                  {r.verified ? <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[12px] text-accent">Покупка підтверджена</span> : null}
                </p>
                {r.text ? <p className="mt-1 whitespace-pre-line text-[15px] text-ink-2">{r.text}</p> : null}
                <textarea
                  value={replies[r._id] ?? r.reply ?? ''}
                  onChange={(e) => setReplies((s) => ({ ...s, [r._id]: e.target.value }))}
                  placeholder="Відповідь магазину (необовʼязково)"
                  rows={2}
                  className="field mt-3"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status !== 'approved' && (
                    <button type="button" onClick={() => patch(r._id, { status: 'approved', reply: replies[r._id] ?? r.reply ?? '' }, 'Опубліковано')} className="btn-primary h-9 px-4 text-[14px]">Опублікувати</button>
                  )}
                  {r.status === 'approved' && replies[r._id] !== undefined && (
                    <button type="button" onClick={() => patch(r._id, { reply: replies[r._id] }, 'Відповідь збережено')} className="btn-primary h-9 px-4 text-[14px]">Зберегти відповідь</button>
                  )}
                  {r.status !== 'rejected' && (
                    <button type="button" onClick={() => patch(r._id, { status: 'rejected' }, 'Відхилено')} className="btn-ghost h-9 px-4 text-[14px]">Відхилити</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminWrapper>
  );
}
