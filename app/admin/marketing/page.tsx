'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Check, Copy, Search, X } from 'lucide-react';
import AdminWrapper from '@/components/AdminWrapper';
import { catalogCategory } from '@/data/catalogCategory';
import { AD_SOURCES, buildAdLink, type AdSource } from '@/lib/adLinks';
import { formatPrice } from '@/lib/format';

type P = { _id: string; title: string; handle: string; image?: string; price: number };
type Order = { total?: number; createdAt?: string; utm?: Record<string, string> };

const PIXELS = [
  { label: 'Google Analytics 4', on: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID), env: 'NEXT_PUBLIC_GA_MEASUREMENT_ID' },
  { label: 'Google Ads', on: Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID), env: 'NEXT_PUBLIC_GOOGLE_ADS_ID' },
  { label: 'Meta Pixel (Facebook / Instagram)', on: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID), env: 'NEXT_PUBLIC_META_PIXEL_ID' },
  { label: 'TikTok Pixel', on: Boolean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID), env: 'NEXT_PUBLIC_TIKTOK_PIXEL_ID' },
];

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Скопійовано', { autoClose: 1200 });
  } catch {
    prompt('Скопіюйте:', text);
  }
}

function sourceOf(o: Order) {
  const u = o.utm;
  if (!u) return 'Без реклами / прямий захід';
  if (u.utm_source) return u.utm_source;
  if (u.fbclid) return 'facebook (fbclid)';
  if (u.gclid) return 'google (gclid)';
  if (u.ttclid) return 'tiktok (ttclid)';
  return 'інше';
}

export default function MarketingPage() {
  const [origin, setOrigin] = useState('');
  const [products, setProducts] = useState<P[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<{ label: string; path: string } | null>(null);
  const [source, setSource] = useState<AdSource>('instagram');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.ok && r.json()).then((d) => d && setProducts(d));
    fetch('/api/admin/getOrders', { cache: 'no-store' }).then((r) => r.ok && r.json()).then((d) => d && setOrders(d));
  }, []);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return products.filter((p) => p.title.toLowerCase().includes(s)).slice(0, 8);
  }, [q, products]);

  const link = target && origin ? buildAdLink(origin, target.path, { source, campaign: campaign || undefined, content: content || undefined }) : '';

  const feeds = origin
    ? [
        { label: 'Усі товари', url: `${origin}/feed/products.xml` },
        { label: 'Лише хіти продажу', url: `${origin}/feed/products.xml?label=hits` },
        { label: 'Лише зі знижкою', url: `${origin}/feed/products.xml?label=sale` },
        { label: 'Лише новинки', url: `${origin}/feed/products.xml?label=new` },
      ]
    : [];

  const bySource = useMemo(() => {
    const map = new Map<string, { count: number; sum: number }>();
    orders.forEach((o) => {
      const k = sourceOf(o);
      const v = map.get(k) ?? { count: 0, sum: 0 };
      v.count += 1;
      v.sum += o.total || 0;
      map.set(k, v);
    });
    return [...map.entries()].sort((a, b) => b[1].sum - a[1].sum);
  }, [orders]);

  return (
    <AdminWrapper>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Конструктор посилань */}
        <section className="panel p-6 lg:row-span-2">
          <h2 className="text-[21px] font-semibold tracking-tight">Посилання для реклами</h2>
          <p className="mt-1 text-[14px] text-ink-2">
            Оберіть товар або категорію — отримаєте посилання з UTM-мітками. Замовлення з нього будуть підписані джерелом у «Замовленнях» і в Telegram.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <span className="field-label">Куди веде реклама</span>
              {target ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3">
                  <span className="min-w-0 truncate text-[14px] font-medium">{target.label}</span>
                  <button type="button" className="hdr-icon -mr-2 h-8 w-8" onClick={() => setTarget(null)} aria-label="Змінити">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <label className="relative block">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-3" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Знайдіть товар за назвою…" className="field pl-10" />
                  </label>
                  {matches.length > 0 && (
                    <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line-soft">
                      {matches.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setTarget({ label: p.title, path: `/product/${p.handle}` });
                              setCampaign(p.handle.slice(0, 40));
                              setQ('');
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-canvas"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-contain" /> : null}
                            <span className="min-w-0 flex-1 truncate text-[14px]">{p.title}</span>
                            <span className="text-[13px] text-ink-2">{formatPrice(p.price)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="chip" onClick={() => setTarget({ label: 'Головна', path: '/' })}>Головна</button>
                    <button type="button" className="chip" onClick={() => { setTarget({ label: 'Акції', path: '/sale' }); setCampaign('sale'); }}>Акції</button>
                    <select
                      className="chip"
                      value=""
                      onChange={(e) => {
                        const [cat, sub] = e.target.value.split('|');
                        const c = catalogCategory.find((x) => x.slug === cat);
                        const s = c?.subcategories.find((x) => x.slug === sub);
                        if (c && s) {
                          setTarget({ label: `${c.title} / ${s.title}`, path: `/category/${c.slug}/${s.slug}` });
                          setCampaign(s.slug.replace(/^category-/, ''));
                        }
                      }}
                    >
                      <option value="">Категорія…</option>
                      {catalogCategory.map((c) => (
                        <optgroup key={c.slug} label={c.title}>
                          {c.subcategories.map((s) => (
                            <option key={s.slug} value={`${c.slug}|${s.slug}`}>{s.title}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <span className="field-label">Де реклама</span>
              <div className="flex flex-wrap gap-2">
                {AD_SOURCES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setSource(s.id)} className={`chip ${source === s.id ? 'chip-active' : ''}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="field-label">Кампанія</span>
                <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="black-friday" className="field" />
              </label>
              <label>
                <span className="field-label">Оголошення <span className="text-ink-3">(необовʼязково)</span></span>
                <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="reels-1" className="field" />
              </label>
            </div>

            {link && (
              <div className="rounded-2xl bg-ink p-4 text-white">
                <p className="text-[12px] text-white/60">Готове посилання</p>
                <p className="mt-1 break-all font-mono text-[13px]">{link}</p>
                <button type="button" onClick={() => copy(link)} className="btn mt-3 h-9 bg-white px-4 text-[13px] text-ink hover:bg-white/90">
                  <Copy className="h-4 w-4" /> Скопіювати
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Фіди */}
        <section className="panel p-6">
          <h2 className="text-[21px] font-semibold tracking-tight">Товарний фід</h2>
          <p className="mt-1 text-[14px] text-ink-2">
            Вставте посилання в Meta Commerce Manager (каталог), Google Merchant Center або TikTok Catalog — і запускайте динамічну рекламу та ретаргетинг на конкретні товари.
            Оновлюється автоматично щогодини.
          </p>
          <ul className="mt-4 divide-y divide-line-soft">
            {feeds.map((f) => (
              <li key={f.url} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium">{f.label}</span>
                  <span className="block truncate text-[12px] text-ink-3">{f.url}</span>
                </span>
                <button type="button" onClick={() => copy(f.url)} className="hdr-icon shrink-0" aria-label={`Скопіювати фід: ${f.label}`}>
                  <Copy className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-3">Фільтр за категорією: додайте <code>?category=slug-категорії</code>, за брендом — <code>?brand=Hoco</code>.</p>
        </section>

        {/* Пікселі */}
        <section className="panel p-6">
          <h2 className="text-[21px] font-semibold tracking-tight">Пікселі та аналітика</h2>
          <ul className="mt-4 space-y-2.5">
            {PIXELS.map((p) => (
              <li key={p.env} className="flex items-start gap-3 text-[14px]">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.on ? 'bg-accent text-white' : 'bg-canvas text-ink-3'}`}>
                  {p.on ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <span>
                  <span className="font-medium">{p.label}</span>
                  {!p.on && <span className="block text-[12px] text-ink-3">Додайте {p.env} у змінні середовища та перезапустіть сайт</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-ink-3">
            Події: перегляд товару, додавання в кошик, оформлення, покупка, обране, пошук — з ID товарів, як у фіді.
          </p>
        </section>

        {/* Джерела замовлень */}
        <section className="panel p-6 lg:col-span-2">
          <h2 className="text-[21px] font-semibold tracking-tight">Звідки приходять замовлення</h2>
          {bySource.length === 0 ? (
            <p className="mt-3 text-[14px] text-ink-2">Ще немає замовлень.</p>
          ) : (
            <table className="mt-4 w-full text-[14px]">
              <thead>
                <tr className="text-left text-[12px] text-ink-3">
                  <th className="pb-2 font-medium">Джерело</th>
                  <th className="pb-2 text-right font-medium">Замовлень</th>
                  <th className="pb-2 text-right font-medium">Сума</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {bySource.map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2.5">{k}</td>
                    <td className="py-2.5 text-right tabular-nums">{v.count}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatPrice(v.sum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminWrapper>
  );
}
