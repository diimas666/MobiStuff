'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, Smartphone, X } from 'lucide-react';
import { useMyPhone } from '@/context/MyPhoneContext';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import { useCart } from '@/context/CartContext';
import { catalogCategory } from '@/data/catalogCategory';
import { Logo } from './Header';
import type { MenuCategory } from '@/lib/getMenuData';
import { useShowIosApp } from './app/AppStoreButton';
import { IOS_APP_URL } from '@/lib/site';

/* Запасний варіант, поки дані меню не завантажились або база недоступна */
const STATIC_MENU: MenuCategory[] = catalogCategory.map((c) => ({
  title: c.title,
  slug: c.slug,
  image: null,
  count: 0,
  subs: c.subcategories.map((s) => ({
    title: s.title,
    slug: s.slug,
    href: `/category/${c.slug}/${s.slug}`,
    image: null,
    count: 0,
  })),
}));

let menuCache: MenuCategory[] | null = null;

const INFO_LINKS = [
  { href: '/account', label: 'Мій кабінет і бали' },
  { href: '/tracking', label: 'Відстежити посилку' },
  { href: '/delivery', label: 'Доставка і оплата' },
  { href: '/returns', label: 'Обмін і повернення' },
  { href: '/contacts', label: 'Контакти' },
  { href: '/about', label: 'Про магазин' },
];

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'товар';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'товари';
  return 'товарів';
};

/** Фото товару з категорії замість абстрактної іконки */
function Thumb({ src, title, size }: { src: string | null; title: string; size: 'sm' | 'lg' }) {
  const box = size === 'sm' ? 'h-14 w-14 rounded-[14px]' : 'aspect-square w-full rounded-[18px]';
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-canvas ${box}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
      ) : (
        <span className={`font-semibold text-ink-3 ${size === 'sm' ? 'text-[20px]' : 'text-[34px]'}`}>{title.charAt(0)}</span>
      )}
    </span>
  );
}

export default function MobileSidebar() {
  const { isOpen, close } = useMobileSidebar();
  const { cart } = useCart();
  const pathname = usePathname();
  const [menu, setMenu] = useState<MenuCategory[]>(menuCache ?? STATIC_MENU);
  const [active, setActive] = useState<MenuCategory | null>(null);
  const [closing, setClosing] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const showApp = useShowIosApp();
  const { phone: myPhone, openPicker } = useMyPhone();

  const dismiss = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      setActive(null);
      close();
    }, 220);
  }, [close]);

  // Закриваємо меню після переходу на іншу сторінку
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname && isOpen) close();
    lastPath.current = pathname;
  }, [pathname, isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    if (!menuCache) {
      fetch('/api/menu')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.categories?.length) {
            menuCache = d.categories;
            setMenu(d.categories);
          }
        })
        .catch(() => {});
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  const openSearch = () => {
    dismiss();
    window.setTimeout(() => window.dispatchEvent(new Event('ms:open-search')), 230);
  };

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Меню">
      <div onClick={dismiss} className={`absolute inset-0 bg-black/30 ${closing ? 'menu-fade-out' : 'menu-fade-in'}`} />

      <aside
        className={`absolute inset-y-0 left-0 flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden bg-canvas shadow-[0_0_60px_rgba(0,0,0,.18)] ${
          closing ? 'menu-slide-out' : 'menu-slide-in'
        }`}
      >
        {/* Верхня панель */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line-soft bg-canvas/90 px-4 backdrop-blur-xl">
          {active ? (
            <button type="button" onClick={() => setActive(null)} className="-ml-1 flex items-center gap-0.5 text-[16px] font-medium text-accent">
              <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              Категорії
            </button>
          ) : (
            <Logo />
          )}
          <button ref={closeBtn} type="button" onClick={dismiss} className="hdr-icon" aria-label="Закрити меню">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Два екрани: категорії → підкатегорії */}
        <div className="relative min-h-0 flex-1">
          <div
            className="flex h-full w-[200%] transition-transform duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
            style={{ transform: active ? 'translateX(-50%)' : 'translateX(0)' }}
          >
            {/* Екран 1 */}
            <div className="h-full w-1/2 overflow-y-auto overscroll-contain px-4 pt-4 pb-10" aria-hidden={Boolean(active)} inert={active ? true : undefined}>
              <button
                type="button"
                onClick={openSearch}
                className="flex h-12 w-full items-center gap-3 rounded-2xl border border-line-soft bg-white px-4 text-left text-[16px] text-ink-3"
              >
                <Search className="h-[18px] w-[18px]" />
                Пошук товарів
              </button>

              <button
                type="button"
                onClick={() => {
                  dismiss();
                  window.setTimeout(openPicker, 230);
                }}
                className="mt-3 flex h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-[15px]"
              >
                <Smartphone className="h-[18px] w-[18px] text-ink-3" />
                <span className="flex-1">{myPhone ?? 'Мій телефон'}</span>
                <span className="text-[13px] text-accent">{myPhone ? 'Змінити' : 'Обрати'}</span>
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Link href="/sale" className="rounded-2xl bg-white px-3 py-3 text-center text-[15px] font-semibold text-sale">
                  Акції
                </Link>
                <Link href="/favorites" className="rounded-2xl bg-white px-3 py-3 text-center text-[15px] font-medium">
                  Обране
                </Link>
                <Link href="/cart" className="relative rounded-2xl bg-white px-3 py-3 text-center text-[15px] font-medium">
                  Кошик
                  {cartCount > 0 && (
                    <span className="absolute top-1.5 right-2 min-w-[18px] rounded-full bg-accent px-1 text-[11px] leading-[18px] font-semibold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              <h2 className="mt-7 mb-2 px-1 text-[13px] font-medium text-ink-3">Категорії</h2>
              <ul className="overflow-hidden rounded-3xl bg-white">
                {menu.map((cat, i) => (
                  <li key={cat.slug} className={i ? 'border-t border-line-soft' : ''}>
                    <button
                      type="button"
                      onClick={() => setActive(cat)}
                      className="flex w-full items-center gap-3.5 px-3 py-2.5 text-left transition-colors active:bg-canvas"
                    >
                      <Thumb src={cat.image} title={cat.title} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-medium tracking-tight">{cat.title}</span>
                        {cat.count > 0 && (
                          <span className="block text-[13px] text-ink-3">
                            {cat.count} {plural(cat.count)}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-3" />
                    </button>
                  </li>
                ))}
              </ul>

              {showApp && (
                <a href={IOS_APP_URL} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-3.5 rounded-3xl bg-white p-3 pr-4 active:bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/app-icon.png" alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-medium tracking-tight">Застосунок MobiStuff</span>
                    <span className="block text-[13px] text-ink-3">Статус замовлення і ТТН у сповіщеннях</span>
                  </span>
                  <span className="rounded-full bg-canvas px-3.5 py-1.5 text-[14px] font-semibold text-accent">Завантажити</span>
                </a>
              )}

              <ul className="mt-6 overflow-hidden rounded-3xl bg-white">
                {INFO_LINKS.map((l, i) => (
                  <li key={l.href} className={i ? 'border-t border-line-soft' : ''}>
                    <Link href={l.href} className="flex items-center justify-between px-4 py-3.5 text-[15px] active:bg-canvas">
                      {l.label}
                      <ChevronRight className="h-4 w-4 text-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Екран 2: підкатегорії */}
            <div className="h-full w-1/2 overflow-y-auto overscroll-contain px-4 pt-5 pb-10" aria-hidden={!active} inert={active ? undefined : true}>
              {active && (
                <>
                  <h2 className="text-[30px] leading-tight font-semibold tracking-[-0.025em]">{active.title}</h2>
                  <div className="mt-1 mb-5 flex items-center justify-between">
                    <span className="text-[14px] text-ink-3">{active.count > 0 ? `${active.count} ${plural(active.count)}` : ''}</span>
                    <Link href={`/catalog#${active.slug}`} className="link-more text-[15px]">
                      Увесь розділ
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-2.5">
                    {active.subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link href={sub.href} className="flex h-full flex-col rounded-3xl bg-white p-2.5 pb-3 transition-transform active:scale-[.98]">
                          <Thumb src={sub.image} title={sub.title} size="lg" />
                          <span className="mt-2.5 line-clamp-2 px-1 text-[14px] leading-snug font-medium">{sub.title}</span>
                          {sub.count > 0 && <span className="mt-0.5 px-1 text-[12px] text-ink-3">{sub.count} {plural(sub.count)}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
