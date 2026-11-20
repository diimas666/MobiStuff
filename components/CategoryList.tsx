'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { catalogCategory } from '@/data/catalogCategory';
import type { MenuCategory } from '@/lib/getMenuData';

/* Поки дані меню (фото, кількість) не завантажились */
const STATIC_MENU: MenuCategory[] = catalogCategory.map((c) => ({
  title: c.title,
  slug: c.slug,
  image: null,
  count: 0,
  subs: c.subcategories.map((s) => ({ title: s.title, slug: s.slug, href: `/category/${c.slug}/${s.slug}`, image: null, count: 0 })),
}));

let menuCache: MenuCategory[] | null = null;

function Thumb({ src, title }: { src: string | null; title: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1 mix-blend-multiply" />
      ) : (
        <span className="text-[15px] font-semibold text-ink-3">{title.charAt(0)}</span>
      )}
    </span>
  );
}

/**
 * Усі категорії: розділ розкривається на місці (працює і у вузькій бічній
 * колонці), підкатегорії — посилання з кількістю товарів, поточна підсвічена.
 */
export default function CategoryList({ onClose }: { onClose?: () => void; variant?: 'light' | 'dark' }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<MenuCategory[]>(menuCache ?? STATIC_MENU);
  const currentSlug = pathname?.startsWith('/category/') ? pathname.split('/')[2] : null;
  const [open, setOpen] = useState<string | null>(currentSlug);

  useEffect(() => {
    if (menuCache) return;
    fetch('/api/menu')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.categories?.length) {
          menuCache = d.categories;
          setMenu(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ul className="space-y-1">
      {menu.map((category) => {
        const isOpen = open === category.slug;
        const subs = category.subs.filter((s) => s.count > 0 || !menuCache);
        return (
          <li key={category.slug}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : category.slug)}
              className={`flex w-full items-center gap-3 rounded-2xl p-1.5 pr-2 text-left transition ${isOpen ? 'bg-canvas' : 'hover:bg-canvas'}`}
            >
              <Thumb src={category.image} title={category.title} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-tight font-medium text-ink">{category.title}</span>
                {category.count > 0 && <span className="block text-[12px] text-ink-3">{category.count} товарів</span>}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <ul className="overflow-hidden">
                {subs.map((sub) => {
                  const active = pathname === sub.href;
                  return (
                    <li key={sub.slug}>
                      <Link
                        href={sub.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`ml-[52px] flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[14px] transition ${active ? 'bg-ink font-medium text-white' : 'text-ink-2 hover:bg-canvas hover:text-ink'}`}
                      >
                        <span className="min-w-0 leading-snug">{sub.title}</span>
                        {sub.count > 0 && <span className={`shrink-0 text-[12px] ${active ? 'text-white/70' : 'text-ink-3'}`}>{sub.count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
