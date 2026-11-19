'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Link2, Loader2, Star, Trash2, X } from 'lucide-react';
import { catalogCategory } from '@/data/catalogCategory';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

export type ProductFormValue = {
  _id?: string;
  handle?: string;
  title: string;
  description: string;
  brand: string;
  images: string[];
  price: string;
  oldPrice: string;
  categorySlug: string;
  subcategorySlug: string;
  inStock: boolean;
  lowStock: boolean;
  isTrending: boolean;
  isNew: boolean;
  isFeatured: boolean;
  tags: string;
  variants: string;
  mmaKey?: string;
};

export const EMPTY_PRODUCT: ProductFormValue = {
  title: '',
  description: '',
  brand: '',
  images: [],
  price: '',
  oldPrice: '',
  categorySlug: '',
  subcategorySlug: '',
  inStock: true,
  lowStock: false,
  isTrending: false,
  isNew: false,
  isFeatured: false,
  tags: '',
  variants: '',
};

/** Перетворює товар з API у значення форми */
export function toFormValue(p: Record<string, any>): ProductFormValue {
  const images = [p.image, ...(p.images ?? [])].filter((x: unknown, i: number, a: unknown[]) => typeof x === 'string' && x && a.indexOf(x) === i);
  return {
    _id: p._id,
    handle: p.handle,
    title: p.title ?? '',
    description: p.description ?? '',
    brand: p.brand ?? '',
    images,
    price: p.price ? String(p.price) : '',
    oldPrice: p.oldPrice && p.oldPrice > p.price ? String(p.oldPrice) : '',
    categorySlug: p.categorySlug ?? '',
    subcategorySlug: p.subcategorySlug ?? '',
    inStock: p.inStock !== false,
    lowStock: Boolean(p.lowStock),
    isTrending: Boolean(p.isTrending),
    isNew: Boolean(p.isNew),
    isFeatured: Boolean(p.isFeatured),
    tags: (p.tags ?? []).join(', '),
    variants: (p.variants ?? []).join(', '),
    mmaKey: p.mmaKey,
  };
}

function Switch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 py-2.5 text-left">
      <span>
        <span className="block text-[15px]">{label}</span>
        {hint && <span className="block text-[12px] text-ink-3">{hint}</span>}
      </span>
      <span className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${checked ? 'bg-accent-bright' : 'bg-line-soft'}`}>
        <span className={`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

export default function ProductForm({ initial, mode }: { initial: ProductFormValue; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValue>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const category = catalogCategory.find((c) => c.slug === v.categorySlug);
  const price = Number(v.price) || 0;
  const oldPrice = Number(v.oldPrice) || 0;
  const discount = oldPrice > price && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
  const dirty = useMemo(() => JSON.stringify(v) !== JSON.stringify(initial), [v, initial]);

  /* ---------- Фото ---------- */
  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    setUploading((n) => n + list.length);
    for (const file of list) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Не вдалося завантажити фото');
        setV((prev) => ({ ...prev, images: [...prev.images, data.files[0].url] }));
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof Error ? e.message : 'помилка'}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!/^https?:\/\//.test(url)) {
      toast.error('Посилання має починатися з https://');
      return;
    }
    if (!v.images.includes(url)) set('images', [...v.images, url]);
    setUrlInput('');
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...v.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  };
  const makeMain = (i: number) => set('images', [v.images[i], ...v.images.filter((_, k) => k !== i)]);
  const removeImage = (i: number) => set('images', v.images.filter((_, k) => k !== i));

  /* ---------- Збереження ---------- */
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: v.title,
      description: v.description,
      brand: v.brand,
      image: v.images[0],
      images: v.images,
      price: v.price,
      oldPrice: v.oldPrice || null,
      categorySlug: v.categorySlug,
      subcategorySlug: v.subcategorySlug,
      inStock: v.inStock,
      lowStock: v.lowStock,
      isTrending: v.isTrending,
      isNew: v.isNew,
      isFeatured: v.isFeatured,
      tags: v.tags,
      variants: v.variants,
    };
    try {
      const res = await fetch(mode === 'create' ? '/api/admin/products' : `/api/admin/products/${v._id}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не вдалося зберегти');
      if (mode === 'create') {
        toast.success('Товар додано');
        router.push(`/admin/products/${data.product._id}`);
      } else {
        toast.success('Зміни збережено');
        setV(toFormValue(data.product));
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!v._id || !confirm(`Видалити «${v.title}»? Це не можна скасувати.`)) return;
    const res = await fetch('/api/admin/deleteProduct', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v._id }),
    });
    if (res.ok) {
      toast.success('Товар видалено');
      router.push('/admin/products');
    } else toast.error('Не вдалося видалити');
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl pb-28">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="btn-ghost h-9 px-3 text-[13px]">
          <ArrowLeft className="h-4 w-4" /> Усі товари
        </Link>
        <h2 className="text-[22px] font-semibold tracking-tight">{mode === 'create' ? 'Новий товар' : 'Редагування товару'}</h2>
        {v.handle && (
          <Link href={`/product/${v.handle}`} target="_blank" className="link-more ml-auto text-[14px]">
            Відкрити на сайті <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {v.mmaKey && (
        <p className="mb-5 rounded-2xl bg-accent-soft px-4 py-3 text-[14px] text-ink-2">
          Товар від постачальника MMA. Те, що ви зміните тут (назва, опис, фото, ціна, позначки), синхронізація більше не перезапише. Наявність і далі оновлюється від постачальника.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {/* Фото */}
          <section className="panel p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-[17px] font-semibold">Фото</h3>
              <span className="text-[13px] text-ink-3">Перше — головне. До 8 МБ, стискаються автоматично</span>
            </div>

            {v.images.length > 0 && (
              <ul className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {v.images.map((src, i) => (
                  <li key={src} className={`group relative overflow-hidden rounded-2xl border bg-white ${i === 0 ? 'border-accent' : 'border-line-soft'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-square w-full object-contain p-1.5" />
                    {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">Головне</span>}
                    <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                      <span className="flex gap-1">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full bg-white/95 p-1.5 shadow disabled:opacity-30" aria-label="Перемістити ліворуч">
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === v.images.length - 1} className="rounded-full bg-white/95 p-1.5 shadow disabled:opacity-30" aria-label="Перемістити праворуч">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <span className="flex gap-1">
                        {i > 0 && (
                          <button type="button" onClick={() => makeMain(i)} className="rounded-full bg-white/95 p-1.5 shadow" aria-label="Зробити головним" title="Зробити головним">
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => removeImage(i)} className="rounded-full bg-white/95 p-1.5 text-sale shadow" aria-label="Видалити фото">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                upload(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
                dragOver ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-3'
              }`}
            >
              {uploading > 0 ? <Loader2 className="h-6 w-6 animate-spin text-accent" /> : <ImagePlus className="h-6 w-6 text-ink-3" />}
              <span className="mt-2 text-[15px] font-medium">{uploading > 0 ? `Завантажуємо (${uploading})…` : 'Додати фото'}</span>
              <span className="text-[13px] text-ink-3">Перетягніть сюди або оберіть з компʼютера чи телефона</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) upload(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                  placeholder="Або вставте посилання на фото"
                  className="field pl-9"
                />
              </div>
              <button type="button" onClick={addUrl} className="btn-ghost shrink-0 px-4" disabled={!urlInput.trim()}>
                Додати
              </button>
            </div>
          </section>

          {/* Основне */}
          <section className="panel space-y-4 p-5">
            <h3 className="text-[17px] font-semibold">Основне</h3>
            <div>
              <label htmlFor="pf-title" className="field-label">Назва</label>
              <input id="pf-title" value={v.title} onChange={(e) => set('title', e.target.value)} placeholder="Наприклад: Навушники TWS Baseus Bowie E9" className="field" required maxLength={200} />
            </div>
            <div>
              <label htmlFor="pf-brand" className="field-label">Бренд</label>
              <input id="pf-brand" value={v.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Baseus" className="field" maxLength={80} />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="pf-desc" className="field-label">Опис</label>
                <button type="button" onClick={() => setPreview((p) => !p)} className="text-[13px] font-medium text-accent">
                  {preview ? 'Редагувати' : 'Попередній перегляд'}
                </button>
              </div>
              {preview ? (
                <div className="prose-product min-h-40 rounded-2xl border border-line-soft bg-white p-4 text-[15px]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(v.description) || '<p style="color:#86868b">Опис порожній</p>' }} />
              ) : (
                <textarea
                  id="pf-desc"
                  value={v.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={9}
                  placeholder="Розкажіть, чим товар корисний: характеристики, комплектація, сумісність. Можна з HTML: <p>, <ul><li>, <b>."
                  className="field min-h-40 py-3 font-[inherit] leading-relaxed"
                />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Ціна */}
          <section className="panel space-y-4 p-5">
            <h3 className="text-[17px] font-semibold">Ціна</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pf-price" className="field-label">Ціна, ₴</label>
                <input id="pf-price" inputMode="numeric" value={v.price} onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="799" className="field" required />
              </div>
              <div>
                <label htmlFor="pf-old" className="field-label">Стара ціна, ₴</label>
                <input id="pf-old" inputMode="numeric" value={v.oldPrice} onChange={(e) => set('oldPrice', e.target.value.replace(/[^\d]/g, ''))} placeholder="Без знижки" className="field" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {discount > 0 ? (
                <span className="rounded-full bg-sale px-2.5 py-1 text-[13px] font-semibold text-white">−{discount}%</span>
              ) : (
                <span className="text-[13px] text-ink-3">Швидка знижка:</span>
              )}
              {[10, 15, 20, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="chip h-8 px-3 text-[13px]"
                  onClick={() => {
                    const base = oldPrice > price ? oldPrice : price;
                    if (!base) return;
                    setV((prev) => ({ ...prev, oldPrice: String(base), price: String(Math.round(base * (1 - d / 100))) }));
                  }}
                >
                  −{d}%
                </button>
              ))}
              {discount > 0 && (
                <button type="button" className="text-[13px] font-medium text-accent" onClick={() => setV((prev) => ({ ...prev, price: prev.oldPrice, oldPrice: '' }))}>
                  Прибрати знижку
                </button>
              )}
            </div>
          </section>

          {/* Категорія */}
          <section className="panel space-y-4 p-5">
            <h3 className="text-[17px] font-semibold">Категорія</h3>
            <div>
              <label htmlFor="pf-cat" className="field-label">Розділ</label>
              <select id="pf-cat" value={v.categorySlug} onChange={(e) => setV((p) => ({ ...p, categorySlug: e.target.value, subcategorySlug: '' }))} className="field" required>
                <option value="">Оберіть розділ</option>
                {catalogCategory.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pf-sub" className="field-label">Підкатегорія</label>
              <select id="pf-sub" value={v.subcategorySlug} onChange={(e) => set('subcategorySlug', e.target.value)} className="field" required disabled={!category}>
                <option value="">{category ? 'Оберіть підкатегорію' : 'Спочатку оберіть розділ'}</option>
                {category?.subcategories.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Позначки */}
          <section className="panel divide-y divide-line-soft px-5 py-2">
            <Switch label="В наявності" checked={v.inStock} onChange={(x) => set('inStock', x)} />
            <Switch label="Закінчується" hint="Покаже «Залишилось мало»" checked={v.lowStock} onChange={(x) => set('lowStock', x)} />
            <Switch label="Хіт продажу" hint="Полиця «Хіти» на головній" checked={v.isTrending} onChange={(x) => set('isTrending', x)} />
            <Switch label="Новинка" hint="Мітка і полиця «Новинки»" checked={v.isNew} onChange={(x) => set('isNew', x)} />
            <Switch label="Рекомендуємо" hint="Великий банер на головній" checked={v.isFeatured} onChange={(x) => set('isFeatured', x)} />
          </section>

          <section className="panel space-y-4 p-5">
            <h3 className="text-[17px] font-semibold">Додатково</h3>
            <div>
              <label htmlFor="pf-var" className="field-label">Варіанти</label>
              <input id="pf-var" value={v.variants} onChange={(e) => set('variants', e.target.value)} placeholder="Чорний, Білий, Синій" className="field" />
            </div>
            <div>
              <label htmlFor="pf-tags" className="field-label">Теги для пошуку</label>
              <input id="pf-tags" value={v.tags} onChange={(e) => set('tags', e.target.value)} placeholder="tws, bluetooth, iphone" className="field" />
            </div>
          </section>

          {mode === 'edit' && (
            <button type="button" onClick={remove} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-medium text-sale hover:bg-sale/[0.06]">
              <Trash2 className="h-4 w-4" /> Видалити товар
            </button>
          )}
        </div>
      </div>

      {/* Панель збереження */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3">
          {dirty && <span className="mr-auto text-[13px] text-ink-3">Є незбережені зміни</span>}
          {mode === 'edit' && dirty && (
            <button type="button" onClick={() => setV(initial)} className="btn-ghost px-4">
              <X className="h-4 w-4" /> Скасувати
            </button>
          )}
          <button type="submit" disabled={saving || uploading > 0 || (!dirty && mode === 'edit')} className="btn-primary min-w-40">
            {saving ? 'Зберігаємо…' : mode === 'create' ? 'Додати товар' : 'Зберегти'}
          </button>
        </div>
      </div>
    </form>
  );
}
