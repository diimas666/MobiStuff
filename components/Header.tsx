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
  const { open } = useMobileSidebar(); // 🟢 Функция, вызываем
  const { cart } = useCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container>
      <header className="glass-header fixed py-4 px-2 z-50 max-w-screen-2xl mx-auto">
        <Link className="absolute left-3 bottom-0" href="/admin">
          <span className="text-[9px] text-gray-200 hover:underline">admin</span>
        </Link>
        <div className="flex items-center justify-between w-full">
          {/* Логотип */}
          {(!isSearchOpen ||
            (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <Link href="/" className="text-2xl font-bold">
              MobiStuff
            </Link>
          )}

          {/* Поиск и иконки */}
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

            {/* Иконки */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="glass-icon"
            >
              <Search className="glass-icon-svg min-w-[40px]" />
            </button>
            <Link
              href="/favorites"
              className="relative glass-icon min-w-[40px]"
            >
              <Heart className="glass-icon-svg" />
              <FavoritesCountBadge />
            </Link>
            <Link href="/cart" className="relative glass-icon min-w-[40px]">
              <ShoppingCart className="glass-icon-svg" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <button onClick={open} className="md:hidden menu-hamburger">
              Menu
            </button>
          </div>
        </div>
      </header>
      <MobileSidebar />
    </Container>
  );
}
