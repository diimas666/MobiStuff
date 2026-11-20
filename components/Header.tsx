'use client';

import { useEffect, useState } from 'react';
import { Heart, Search, ShoppingBag, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import Container from './Container';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import MyPhoneButton from '@/components/phone/MyPhoneButton';
import MobileSidebar from './MobileSidebar';
import FavoritesCountBadge from '@/components/FavoritesCountBadge';
import { useCart } from '@/context/CartContext';
import { SITE_NAME } from '@/lib/site';

const NAV = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Навушники', href: '/category/category-naushniki/category-bluetooth-stereo-garnituri-tws' },
  { label: 'Зарядки', href: '/category/category-zaryadki-i-kabeli/category-besprovodnie-zaryadnie-ustroystva' },
  { label: 'Павербанки', href: '/category/category-akkumulyatori-i-powerbank/category-portativnie-batarei' },
  { label: 'Годинники', href: '/category/category-gadzheti/category-umnie-chasi-i-fitnes-trekeri' },
  { label: 'Колонки', href: '/category/category-audio-i-video/category-portativnie-kolonki' },
  { label: 'Акції', href: '/sale', accent: true },
];

export function Logo() {
  const name = SITE_NAME;
  const split = name === 'MobiStuff' ? ['Mobi', 'Stuff'] : [name, ''];
  return (
    <Link href="/" className="shrink-0 text-[21px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px]" aria-label={`${name} — на головну`}>
      {split[0]}
      <span className="text-accent">{split[1]}</span>
    </Link>
  );
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open } = useMobileSidebar();
  const { cart } = useCart();
  const pathname = usePathname();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Закриваємо пошук при переході між сторінками
  useEffect(() => setIsSearchOpen(false), [pathname]);

  // Пошук можна відкрити з мобільного меню
  useEffect(() => {
    const openSearch = () => setIsSearchOpen(true);
    window.addEventListener('ms:open-search', openSearch);
    return () => window.removeEventListener('ms:open-search', openSearch);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled || isSearchOpen ? 'is-scrolled' : ''}`}>
        <Container>
          <div className="flex h-[60px] items-center justify-between gap-4 sm:h-[64px]">
            <Logo />

            <nav aria-label="Основна навігація" className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = pathname === item.href || (item.href !== '/catalog' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                          active ? 'bg-ink/[0.06] text-ink' : item.accent ? 'text-sale hover:bg-sale/[0.06]' : 'text-ink-2 hover:text-ink'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <MyPhoneButton className="hidden xl:inline-flex" />
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className={`hdr-icon ${isSearchOpen ? 'bg-ink/[0.06]' : ''}`}
                aria-label="Пошук"
                aria-expanded={isSearchOpen}
              >
                <Search className="h-[19px] w-[19px]" strokeWidth={1.9} />
              </button>
              <Link href="/account" className="hdr-icon hidden sm:flex" aria-label="Мій кабінет">
                <UserRound className="h-[19px] w-[19px]" strokeWidth={1.8} />
              </Link>
              <Link href="/favorites" className="hdr-icon relative" aria-label="Обране">
                <Heart className="h-[19px] w-[19px]" strokeWidth={1.9} />
                <FavoritesCountBadge />
              </Link>
              <Link href="/cart" className="hdr-icon relative" aria-label={`Кошик${totalQuantity ? `, товарів: ${totalQuantity}` : ''}`}>
                <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.9} />
                {totalQuantity > 0 && <span className="hdr-badge">{totalQuantity}</span>}
              </Link>
              <button type="button" onClick={open} className="hdr-menu lg:hidden" aria-label="Відкрити меню">
                Меню
              </button>
            </div>
          </div>
        </Container>

        {isSearchOpen && <SearchBar setIsSearchOpen={setIsSearchOpen} />}
      </header>
      <MobileSidebar />
    </>
  );
}
