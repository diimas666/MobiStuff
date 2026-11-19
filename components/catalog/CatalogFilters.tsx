'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import { groupPhoneModels } from '@/lib/glassPhoneFilter';
import { formatPrice } from '@/lib/format';
import { useFilters } from './FilterContext';

export interface FacetData {
  brands: string[];
  brandCounts?: Record<string, number>;
  phoneModels: string[];
  minPrice: number;
  maxPrice: number;
  count: number;
}

/* ---------- Секція з розгортанням ---------- */
function Section({
  title,
  hint,
  defaultOpen = true,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line-soft py-4 first:pt-0 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="flex items-center gap-2">
          {hint ? <span className="max-w-[120px] truncate text-[13px] text-accent">{hint}</span> : null}
          <ChevronDown className={`h-4 w-4 text-ink-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3.5">{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Список варіантів з одним вибором (бренд, модель) ---------- */
/* Рядок списку — окремий компонент, щоб не перемонтовувався на кожен рендер */
function Row({ label, selected, count, onClick }: { label: string; selected: boolean; count?: number; onClick: () => void }) {
  return (
  <li>
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] transition-colors hover:bg-canvas ${
        selected ? 'font-medium text-ink' : 'text-ink-2'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
          selected ? 'border-accent bg-accent text-white' : 'border-line group-hover:border-ink-3'
        }`}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' && <span className="text-[13px] text-ink-3 tabular-nums">{count}</span>}
    </button>
  </li>
);
}

function OptionList({
  options,
  value,
  onSelect,
  counts,
  allLabel,
  searchPlaceholder,
}: {
  options: string[];
  value: string;
  onSelect: (v: string | null) => void;
  counts?: Record<string, number>;
  allLabel: string;
  searchPlaceholder: string;
}) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 6;
  const filtered = useMemo(
    () => (q.trim() ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase())) : options),
    [options, q]
  );
  // вибраний варіант завжди видно, навіть якщо список згорнуто
  const visible = expanded || q ? filtered : filtered.slice(0, LIMIT);
  const shown = value && !visible.includes(value) && filtered.includes(value) ? [value, ...visible] : visible;


  return (
    <div>
      {options.length > 8 && (
        <label className="relative mb-2 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl bg-canvas pr-3 pl-9 text-[14px] outline-none placeholder:text-ink-3 focus:bg-white focus:ring-2 focus:ring-accent/30"
          />
        </label>
      )}
      <ul role="radiogroup" className="-mx-2 space-y-0.5">
        {!q && <Row label={allLabel} selected={!value} onClick={() => onSelect(null)} />}
        {shown.map((o) => (
          <Row key={o} label={o} selected={value === o} count={counts?.[o]} onClick={() => onSelect(value === o ? null : o)} />
        ))}
      </ul>
      {!q && filtered.length > LIMIT && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="link-more mt-2 text-[14px]">
          {expanded ? 'Згорнути' : `Показати всі (${filtered.length})`}
        </button>
      )}
      {q && filtered.length === 0 && <p className="px-2 py-2 text-[14px] text-ink-3">Нічого не знайдено</p>}
    </div>
  );
}

/* ---------- Перемикач ---------- */
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-2 text-left"
    >
      <span>
        <span className="block text-[15px]">{label}</span>
        {hint ? <span className="block text-[12px] text-ink-3">{hint}</span> : null}
      </span>
      <span
        className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-accent-bright' : 'bg-line-soft'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_1px_1px_rgba(0,0,0,.16)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  );
}

/* ---------- Ціна ---------- */
function PriceFilter({ bounds }: { bounds: { min: number; max: number } }) {
  const { params, setParams } = useFilters();
  const pMin = params.get('minPrice');
  const pMax = params.get('maxPrice');
  const [min, setMin] = useState(pMin ? Number(pMin) : bounds.min);
  const [max, setMax] = useState(pMax ? Number(pMax) : bounds.max);
  const latest = useRef({ min, max });
  useEffect(() => {
    latest.current = { min, max };
  }, [min, max]);

  useEffect(() => {
    setMin(pMin ? Number(pMin) : bounds.min);
    setMax(pMax ? Number(pMax) : bounds.max);
  }, [pMin, pMax, bounds.min, bounds.max]);

  const commit = (lo = latest.current.min, hi = latest.current.max) => {
    const a = Math.max(bounds.min, Math.min(lo, hi));
    const b = Math.min(bounds.max, Math.max(lo, hi));
    setMin(a);
    setMax(b);
    setParams({
      minPrice: a > bounds.min ? String(a) : null,
      maxPrice: b < bounds.max ? String(b) : null,
    });
  };

  // Швидкі діапазони за квартилями поточної категорії
  const presets = useMemo(() => {
    const span = bounds.max - bounds.min;
    if (span < 200) return [];
    const round = (n: number) => (n > 1000 ? Math.round(n / 100) * 100 : Math.round(n / 50) * 50);
    const a = round(bounds.min + span * 0.2);
    const b = round(bounds.min + span * 0.5);
    return [
      { label: `до ${formatPrice(a)}`, lo: bounds.min, hi: a },
      { label: `${a}–${formatPrice(b)}`, lo: a, hi: b },
      { label: `від ${formatPrice(b)}`, lo: b, hi: bounds.max },
    ];
  }, [bounds.min, bounds.max]);

  const field = (value: number, onChange: (n: number) => void, label: string) => (
    <label className="relative flex-1">
      <span className="pointer-events-none absolute top-1.5 left-3 text-[11px] text-ink-3">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={() => commit()}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="h-12 w-full rounded-xl bg-canvas px-3 pt-4 text-[15px] font-medium tabular-nums outline-none focus:bg-white focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={`Ціна ${label}`}
      />
      <span className="pointer-events-none absolute right-3 bottom-3 text-[13px] text-ink-3">₴</span>
    </label>
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        {field(min, setMin, 'від')}
        <span className="text-ink-3">—</span>
        {field(max, setMax, 'до')}
      </div>
      <div className="mt-4 px-1" onPointerUp={() => commit()} onKeyUp={() => commit()} onTouchEnd={() => commit()}>
        <PriceRangeSlider
          min={bounds.min}
          max={bounds.max}
          minValue={min}
          maxValue={max}
          hideLabels
          onChange={(a, b) => {
            setMin(a);
            setMax(b);
          }}
        />
      </div>
      {presets.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const active = min === p.lo && max === p.hi;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => commit(p.lo, p.hi)}
                className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                  active ? 'bg-ink text-white' : 'bg-canvas text-ink-2 hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Панель фільтрів ---------- */
export default function CatalogFilters({ facets }: { facets: FacetData }) {
  const { params, setParams } = useFilters();
  const brand = params.get('brand') ?? '';
  const phone = params.get('phone') ?? '';
  const onSale = params.get('onSale') === 'true';
  const hits = params.get('isTrending') === 'true';
  const pMin = params.get('minPrice');
  const pMax = params.get('maxPrice');

  const bounds = { min: facets.minPrice, max: Math.max(facets.maxPrice, facets.minPrice + 1) };
  const showPrice = facets.count > 1 && facets.maxPrice > facets.minPrice;
  const phoneModels = useMemo(() => groupPhoneModels(facets.phoneModels).flatMap((g) => g.models), [facets.phoneModels]);

  const priceHint =
    pMin || pMax ? `${pMin ? formatPrice(Number(pMin)) : formatPrice(bounds.min)} – ${pMax ? formatPrice(Number(pMax)) : formatPrice(bounds.max)}` : undefined;

  return (
    <div>
      {showPrice && (
        <Section title="Ціна" hint={priceHint}>
          <PriceFilter bounds={bounds} />
        </Section>
      )}

      {facets.brands.length > 0 && (
        <Section title="Бренд" hint={brand || undefined}>
          <OptionList
            options={facets.brands}
            counts={facets.brandCounts}
            value={brand}
            onSelect={(v) => setParams({ brand: v })}
            allLabel="Усі бренди"
            searchPlaceholder="Пошук бренду"
          />
        </Section>
      )}

      {phoneModels.length > 0 && (
        <Section title="Модель телефону" hint={phone || undefined}>
          <OptionList
            options={phoneModels}
            value={phone}
            onSelect={(v) => setParams({ phone: v })}
            allLabel="Усі моделі"
            searchPlaceholder="Наприклад, iPhone 15"
          />
        </Section>
      )}

      <Section title="Пропозиції">
        <div className="-my-1">
          <Toggle label="Зі знижкою" hint="Товари за акційною ціною" checked={onSale} onChange={(v) => setParams({ onSale: v ? 'true' : null })} />
          <Toggle label="Хіти продажу" hint="Те, що купують найчастіше" checked={hits} onChange={(v) => setParams({ isTrending: v ? 'true' : null })} />
        </div>
      </Section>
    </div>
  );
}
