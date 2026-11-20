'use client';

import { useEffect, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { formatPrice } from '@/lib/format';

type Data = { totals: Record<string, { count: number; value: number }>; errors: { message: string; screen?: string; count: number; lastAt: string; fatal?: boolean; appVersion?: string }[] };

const FUNNEL = [
  { key: 'app_open', label: 'Відкриття застосунку' },
  { key: 'view_product', label: 'Перегляди товарів' },
  { key: 'add_to_cart', label: 'Додали в кошик' },
  { key: 'begin_checkout', label: 'Почали оформлення' },
  { key: 'purchase', label: 'Покупки' },
];

/** Статистика застосунку за 30 днів і помилки */
export default function AdminAppPage() {
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    fetch('/api/admin/app-stats', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setD)
      .catch(() => {});
  }, []);
  const max = Math.max(1, ...FUNNEL.map((f) => d?.totals[f.key]?.count ?? 0));

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Застосунок</h2>
          <p className="text-[14px] text-ink-3">Останні 30 днів. Лише лічильники — без даних покупців.</p>
        </div>

        <section className="panel space-y-3 p-5">
          {FUNNEL.map((f, i) => {
            const n = d?.totals[f.key]?.count ?? 0;
            const prev = i > 0 ? d?.totals[FUNNEL[i - 1].key]?.count ?? 0 : 0;
            return (
              <div key={f.key}>
                <div className="flex justify-between text-[14px]">
                  <span>{f.label}</span>
                  <span className="font-semibold">
                    {n}
                    {i > 0 && prev ? <span className="ml-2 font-normal text-ink-3">{Math.round((n / prev) * 100)}%</span> : null}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-canvas">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-[14px] text-ink-2">Виручка із застосунку: <b>{formatPrice(d?.totals.purchase?.value ?? 0)}</b></p>
        </section>

        <section>
          <h3 className="mb-3 text-[17px] font-semibold">Помилки</h3>
          {!d?.errors.length ? (
            <p className="panel px-5 py-8 text-center text-[14px] text-ink-3">Помилок немає 🎉</p>
          ) : (
            <ul className="overflow-hidden rounded-3xl bg-white">
              {d.errors.map((e, i) => (
                <li key={i} className={`px-4 py-3 ${i ? 'border-t border-line-soft' : ''}`}>
                  <p className="text-[14px] font-medium">{e.fatal ? '💥 ' : ''}{e.message}</p>
                  <p className="text-[12px] text-ink-3">
                    {e.count}× · {e.screen || 'екран невідомий'} · v{e.appVersion || '?'} · {new Date(e.lastAt).toLocaleString('uk-UA')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminWrapper>
  );
}
