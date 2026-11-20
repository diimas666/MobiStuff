'use client';

import { useEffect, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { formatPrice } from '@/lib/format';

type Data = {
  carts: { id: string; phone?: string; email?: string; name?: string; total?: number; items: { title: string; quantity: number }[]; notifiedAt?: string; updatedAt: string }[];
  alerts: { productId: string; handle?: string; title?: string; count: number; contacts: string[] }[];
  soldOut: { handle: string; title: string; qty: number; price?: number }[];
};

const when = (s?: string) => (s ? new Date(s).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

/** Кому подзвонити: брошені кошики, очікують товар, що закінчилось */
export default function LeadsPage() {
  const [d, setD] = useState<Data | null>(null);
  const [tab, setTab] = useState<'carts' | 'alerts' | 'soldOut'>('carts');
  useEffect(() => {
    fetch('/api/admin/leads', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setD)
      .catch(() => setD({ carts: [], alerts: [], soldOut: [] }));
  }, []);

  const tabs = [
    { key: 'carts', label: `Брошені кошики (${d?.carts.length ?? 0})` },
    { key: 'alerts', label: `Чекають товар (${d?.alerts.length ?? 0})` },
    { key: 'soldOut', label: `Закінчились хіти (${d?.soldOut.length ?? 0})` },
  ] as const;

  return (
    <AdminWrapper>
      <div className="space-y-5 pb-16">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Нагадування</h2>
          <p className="text-[14px] text-ink-3">Кому варто подзвонити або написати — за останні 30 днів. Автоматичні нагадування надсилаються щодня о 9:00.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`chip ${tab === t.key ? 'bg-ink text-white' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {!d ? (
          <p className="panel px-5 py-10 text-center text-ink-3">Завантаження…</p>
        ) : tab === 'carts' ? (
          d.carts.length ? (
            <ul className="overflow-hidden rounded-3xl bg-white">
              {d.carts.map((c, i) => (
                <li key={c.id} className={`px-5 py-4 ${i ? 'border-t border-line-soft' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {c.name || 'Без імені'} · {c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : c.email}
                    </p>
                    <p className="font-semibold">{formatPrice(c.total ?? 0)}</p>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-2">{c.items.map((x) => `${x.title}${x.quantity > 1 ? ` ×${x.quantity}` : ''}`).join(' · ')}</p>
                  <p className="mt-1 text-[12px] text-ink-3">
                    {when(c.updatedAt)}
                    {c.notifiedAt ? ` · нагадування надіслано ${when(c.notifiedAt)}` : ' · нагадування ще не надсилали'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel px-5 py-10 text-center text-ink-3">Брошених кошиків немає</p>
          )
        ) : tab === 'alerts' ? (
          d.alerts.length ? (
            <ul className="overflow-hidden rounded-3xl bg-white">
              {d.alerts.map((a, i) => (
                <li key={a.productId} className={`px-5 py-4 ${i ? 'border-t border-line-soft' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a href={`/product/${a.handle}`} target="_blank" className="font-medium hover:underline">{a.title || a.handle}</a>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-semibold text-accent">{a.count} чекають</span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-3">{a.contacts.filter(Boolean).join(', ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel px-5 py-10 text-center text-ink-3">Підписок немає</p>
          )
        ) : d.soldOut.length ? (
          <ul className="overflow-hidden rounded-3xl bg-white">
            {d.soldOut.map((p, i) => (
              <li key={p.handle} className={`flex items-center justify-between gap-3 px-5 py-4 ${i ? 'border-t border-line-soft' : ''}`}>
                <a href={`/product/${p.handle}`} target="_blank" className="font-medium hover:underline">{p.title}</a>
                <span className="shrink-0 text-[13px] text-ink-3">продано {p.qty} шт. · немає в MMA</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel px-5 py-10 text-center text-ink-3">Усі ходові товари в наявності</p>
        )}
      </div>
    </AdminWrapper>
  );
}
