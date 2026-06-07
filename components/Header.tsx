'use client';
import { useState } from 'react';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import Container from './Container';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import MobileSidebar from './MobileSidebar';
import FavoritesCountBadge from '@/components/FavoritesCountBadge';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { open } = useMobileSidebar();
  const { cart } = useCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const showLogo =
    !isSearchOpen ||
    (typeof window !== 'undefined' && window.innerWidth >= 768);

  return (
    <>
      <header className="glass-header">
        <Container>
          <div className="flex items-center justify-between py-3.5 relative">
            <Link
              className="absolute -bottom-1 left-0 opacity-0 hover:opacity-100 transition-opacity"
              href="/admin"
            >
              <span className="text-[9px] text-gray-500 hover:text-gray-400">
                admin
              </span>
            </Link>

            {showLogo && (
              <Link href="/" className="shrink-0 group">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Mobi
                  <span className="text-green-400 group-hover:text-green-300 transition-colors">
                    Stuff
                  </span>
                </span>
              </Link>
            )}

            <div
              className={`flex items-center gap-2 ${
                isSearchOpen ? 'flex-1 justify-between md:justify-end' : ''
              }`}
            >
              {isSearchOpen && (
                <div className="w-full max-w-[90vw] sm:max-w-[500px] md:max-w-[400px] lg:max-w-[600px] flex-1">
                  <SearchBar setIsSearchOpen={setIsSearchOpen} />
                </div>
              )}

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="glass-icon"
                aria-label="Пошук"
              >
                <Search className="glass-icon-svg min-w-[20px]" />
              </button>
              <Link
                href="/favorites"
                className="relative glass-icon min-w-[40px]"
                aria-label="Обране"
              >
                <Heart className="glass-icon-svg" />
                <FavoritesCountBadge />
              </Link>
              <Link
                href="/cart"
                className="relative glass-icon min-w-[40px]"
                aria-label="Кошик"
              >
                <ShoppingCart className="glass-icon-svg" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full z-10 ring-2 ring-gray-900">
                    {totalQuantity}
                  </span>
                )}
              </Link>
              <button
                onClick={open}
                className="md:hidden menu-hamburger"
                aria-label="Меню"
              >
                Menu
              </button>
            </div>
          </div>
        </Container>
      </header>
      <MobileSidebar />
    </>
  );
}
