'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Check, ExternalLink, Flame, Link2, Search, Sparkles, Star, Trash2, X } from 'lucide-react';
import AdminWrapper from '@/components/AdminWrapper';
import { adminHeaders } from '@/lib/adminHeaders';
import { catalogCategory } from '@/data/catalogCategory';
import { buildAdLink, AD_SOURCES, type AdSource } from '@/lib/adLinks';

type AdminProduct = {
  _id: string;
  title: string;
  handle: string;
  image?: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  inStock?: boolean;
  lowStock?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  brand?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  mmaKey?: string;
  priceManuallyEdited?: boolean;
};

const SEGMENTS = [
  { id: 'all', label: 'Усі' },
  { id: 'hits', label: 'Хіти' },
  { id: 'new', label: 'Новинки' },
  { id: 'featured', label: 'Рекомендуємо' },
  { id: 'sale', label: 'Зі знижкою' },
  { id: 'out', label: 'Немає в наявності' },
] as const;
type Segment = (typeof SEGMENTS)[number]['id'];

const PAGE_SIZE = 60;

const onSale = (p: AdminProduct) => Boolean(p.oldPrice && p.oldPrice > p.price);

export default function AllProductsAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [adSource, setAdSource] = useState<AdSource>('instagram');

  useEffect(() => {
    fetch('/api/admin/products', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? [] : r.ok ? r.json() : Promise.reject()))
      .then(setProducts)
      .catch(() => toast.error('Не вдалося завантажити товари'))
      .finally(() => setLoading(false));
  }, []);

  const subcategoryOptions = useMemo(
    () => catalogCategory.find((c) => c.slug === categoryFilter)?.subcategories ?? [],
    [categoryFilter]
  );

  const categoryLabel = (p: AdminProduct) => {
    const cat = catalogCategory.find((c) => c.slug === p.categorySlug);
    const sub = cat?.subcategories.find((s) => s.slug === p.subcategorySlug);
    return [cat?.title, sub?.title].filter(Boolean).join(' / ') || '—';
  };

  const counts = useMemo(
    () => ({
      all: products.length,
      hits: products.filter((p) => p.isTrending).length,
      new: products.filter((p) => p.isNew).length,
      featured: products.filter((p) => p.isFeatured).length,
      sale: products.filter(onSale).length,
      out: products.filter((p) => p.inStock === false).length,
    }),
    [products]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (segment === 'hits' && !p.isTrending) return false;
      if (segment === 'new' && !p.isNew) return false;
      if (segment === 'featured' && !p.isFeatured) return false;
      if (segment === 'sale' && !onSale(p)) return false;
      if (segment === 'out' && p.inStock !== false) return false;
      if (categoryFilter && p.categorySlug !== categoryFilter) return false;
      if (subcategoryFilter && p.subcategorySlug !== subcategoryFilter) return false;
      if (!q) return true;
      return [p.title, p.handle, p.mmaKey, p.brand].some((v) => v?.toLowerCase().includes(q));
    });
  }, [products, segment, categoryFilter, subcategoryFilter, searchQuery]);

  useEffect(() => setPage(1), [segment, categoryFilter, subcategoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((p) => selected.has(p._id));

  const merge = (id: string, patchData: Partial<AdminProduct>) =>
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, ...patchData } : p)));

  const patch = async (id: string, body: Record<string, unknown>, okMsg: string) => {
    try {
      const res = await fetch('/api/admin/updateProduct', {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      merge(id, data.product ?? body);
      toast.success(okMsg, { autoClose: 1200 });
    } catch (e) {
      toast.error((e as Error).message || 'Не вдалося зберегти');
    }
  };

  const toggle = (p: AdminProduct, key: 'isTrending' | 'isNew' | 'isFeatured') => {
    const labels = { isTrending: 'Хіт продажу', isNew: 'Новинка', isFeatured: 'Рекомендуємо' };
    const next = !p[key];
    merge(p._id, { [key]: next });
    patch(p._id, { [key]: next }, `${labels[key]}: ${next ? 'увімкнено' : 'вимкнено'}`);
  };

  const cycleStock = (p: AdminProduct) => {
    const status = p.inStock === false ? 'out' : p.lowStock ? 'low' : 'in';
    const next =
      status === 'in'
        ? { inStock: true, lowStock: true }
        : status === 'low'
          ? { inStock: false, lowStock: false }
          : { inStock: true, lowStock: false };
    merge(p._id, next);
    patch(p._id, next, 'Наявність оновлено');
  };

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Видалити «${p.title}»? Це не можна скасувати.`)) return;
    const res = await fetch('/api/admin/deleteProduct', {
      method: 'DELETE',
      headers: adminHeaders(),
      body: JSON.stringify({ id: p._id }),
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
      toast.success('Товар видалено');
    } else toast.error('Не вдалося видалити');
  };

  const copyAdLink = async (p: AdminProduct) => {
    const url = buildAdLink(window.location.origin, `/product/${p.handle}`, {
      source: adSource,
      campaign: p.handle.slice(0, 60),
    });
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Посилання для реклами скопійовано', { autoClose: 1500 });
    } catch {
      prompt('Скопіюйте посилання:', url);
    }
  };

  const bulk = async (body: Record<string, unknown>, msg: string) => {
    const ids = [...selected];
    const res = await fetch('/api/admin/bulkUpdate', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ ids, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || 'Помилка');
    const fresh = await fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.json());
    setProducts(fresh);
    setSelected(new Set());
    toast.success(`${msg} (${ids.length})`);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AdminWrapper>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSegment(s.id)}
            className={`chip shrink-0 ${segment === s.id ? 'chip-active' : ''}`}
          >
            {s.label}
            <span className="ml-1.5 tabular-nums opacity-60">{counts[s.id]}</span>
          </button>
        ))}
      </div>

      <div className="panel mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Назва, бренд, артикул MMA…"
            className="field pl-10"
          />
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setSubcategoryFilter('');
          }}
          className="field"
          aria-label="Категорія"
        >
          <option value="">Усі категорії</option>
          {catalogCategory.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={subcategoryFilter}
          onChange={(e) => setSubcategoryFilter(e.target.value)}
          disabled={!categoryFilter}
          className="field disabled:opacity-50"
          aria-label="Підкатегорія"
        >
          <option value="">Усі підкатегорії</option>
          {subcategoryOptions.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        <select
          value={adSource}
          onChange={(e) => setAdSource(e.target.value as AdSource)}
          className="field"
          aria-label="Джерело для рекламних посилань"
          title="Для кнопки «Посилання для реклами»"
        >
          {AD_SOURCES.map((s) => (
            <option key={s.id} value={s.id}>
              Реклама: {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={() =>
              setSelected((prev) => {
                const next = new Set(prev);
                pageItems.forEach((p) => (allOnPageSelected ? next.delete(p._id) : next.add(p._id)));
                return next;
              })
            }
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Вибрати всі на сторінці
        </label>
        <span>
          {loading ? 'Завантаження…' : `Показано ${pageItems.length} з ${filtered.length} (усього ${products.length})`}
        </span>
      </div>

      <ul className="space-y-2">
        {pageItems.map((p) => {
          const stock = p.inStock === false ? 'out' : p.lowStock ? 'low' : 'in';
          return (
            <li
              key={p._id}
              className={`panel grid grid-cols-[auto_56px_1fr] items-center gap-x-3 gap-y-3 p-3 sm:p-4 lg:grid-cols-[auto_56px_minmax(0,1fr)_200px_auto_auto] ${
                selected.has(p._id) ? 'ring-2 ring-accent' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(p._id)}
                onChange={() => toggleSelect(p._id)}
                className="h-4 w-4 accent-[var(--accent)]"
                aria-label={`Вибрати ${p.title}`}
              />
              <span className="relative h-14 w-14 overflow-hidden rounded-xl bg-canvas">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" loading="lazy" />
                ) : null}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[14px] leading-snug font-medium">{p.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-ink-3">
                  {[p.brand, categoryLabel(p), p.priceManuallyEdited ? 'ціна вручну' : ''].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="col-span-3 flex items-center gap-2 lg:col-span-1">
                <label className="relative flex-1">
                  <input
                    type="number"
                    min={1}
                    key={`price-${p._id}-${p.price}`}
                    defaultValue={p.price}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v > 0 && v !== p.price) patch(p._id, { price: v }, 'Ціну оновлено');
                    }}
                    className="field h-10 pr-7 text-[14px]"
                    aria-label="Ціна"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-ink-3">₴</span>
                </label>
                <label className="relative w-[84px]">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    key={`disc-${p._id}-${p.discountPercent ?? 0}`}
                    defaultValue={p.discountPercent || ''}
                    placeholder="0"
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      if (v !== (p.discountPercent || 0))
                        patch(p._id, { discountPercent: v }, v ? `Знижка −${v}%` : 'Знижку знято');
                    }}
                    className="field h-10 pr-7 text-[14px]"
                    aria-label="Знижка, %"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-ink-3">%</span>
                </label>
              </div>

              <div className="col-span-3 flex flex-wrap items-center gap-1.5 lg:col-span-1">
                <Flag on={p.isTrending} onClick={() => toggle(p, 'isTrending')} icon={Flame} label="Хіт" />
                <Flag on={p.isNew} onClick={() => toggle(p, 'isNew')} icon={Sparkles} label="Новинка" />
                <Flag on={p.isFeatured} onClick={() => toggle(p, 'isFeatured')} icon={Star} label="Топ" />
                <button
                  type="button"
                  onClick={() => cycleStock(p)}
                  title="Клік: В наявності → Закінчується → Немає"
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                    stock === 'in'
                      ? 'bg-accent-soft text-accent'
                      : stock === 'low'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-canvas text-ink-3'
                  }`}
                >
                  {stock === 'in' ? 'В наявності' : stock === 'low' ? 'Закінчується' : 'Немає'}
                </button>
              </div>

              <div className="col-span-3 flex items-center justify-end gap-1 lg:col-span-1">
                <button type="button" onClick={() => copyAdLink(p)} className="hdr-icon" title="Скопіювати посилання для реклами">
                  <Link2 className="h-4 w-4" />
                </button>
                <Link href={`/product/${p.handle}`} target="_blank" className="hdr-icon" title="Відкрити на сайті">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button type="button" onClick={() => remove(p)} className="hdr-icon text-sale" title="Видалити">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {!loading && filtered.length === 0 && (
        <p className="py-16 text-center text-ink-2">Нічого не знайдено. Змініть фільтри.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" className="btn-ghost h-9 px-4" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
            Назад
          </button>
          <span className="px-2 text-[14px] text-ink-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost h-9 px-4"
            disabled={page >= totalPages}
            onClick={() => setPage((n) => n + 1)}
          >
            Далі
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/90 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2">
            <span className="mr-2 text-[14px] font-semibold">Вибрано: {selected.size}</span>
            <button type="button" className="chip" onClick={() => bulk({ set: { isTrending: true } }, 'Додано в хіти')}>
              <Flame className="mr-1 h-4 w-4" /> У хіти
            </button>
            <button type="button" className="chip" onClick={() => bulk({ set: { isTrending: false } }, 'Прибрано з хітів')}>
              Прибрати з хітів
            </button>
            <button type="button" className="chip" onClick={() => bulk({ set: { isNew: true } }, 'Позначено як новинки')}>
              <Sparkles className="mr-1 h-4 w-4" /> Новинка
            </button>
            <button type="button" className="chip" onClick={() => bulk({ set: { isNew: false } }, 'Знято «Новинка»')}>
              Не новинка
            </button>
            <span className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={99}
                value={bulkDiscount}
                onChange={(e) => setBulkDiscount(e.target.value)}
                placeholder="%"
                className="field h-9 w-20 text-[14px]"
                aria-label="Знижка для вибраних"
              />
              <button
                type="button"
                className="chip"
                disabled={!bulkDiscount}
                onClick={() => bulk({ discountPercent: Number(bulkDiscount) }, `Знижка −${bulkDiscount}%`)}
              >
                Знижка
              </button>
            </span>
            <button type="button" className="chip" onClick={() => bulk({ discountPercent: 0 }, 'Знижки знято')}>
              Зняти знижку
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => bulk({ set: { inStock: false, lowStock: false } }, 'Немає в наявності')}
            >
              Немає в наявності
            </button>
            <button type="button" className="hdr-icon ml-auto" onClick={() => setSelected(new Set())} aria-label="Скасувати вибір">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </AdminWrapper>
  );
}

function Flag({
  on,
  onClick,
  icon: Icon,
  label,
}: {
  on?: boolean;
  onClick: () => void;
  icon: typeof Flame;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(on)}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
        on ? 'bg-ink text-white' : 'bg-canvas text-ink-2 hover:text-ink'
      }`}
    >
      {on ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
