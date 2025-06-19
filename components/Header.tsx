'use client';

import { useState } from 'react';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import Container from './Container';
import MobileSidebar from './MobileSidebar';
export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSideBarOpen, setIsMobileSideBarOpen] = useState(false);
  return (
    <Container>
      <header className="glass-header sticky top-0 z-50 flex py-4">
        {/* Левая часть: логотип + поиск */}
        <div className="flex items-center flex-1 relative transition-all">
          {/* ЛОГОТИП — исчезает при isSearchOpen */}
          <Link
            href="/"
            className={`text-lg font-bold text-gray-900 transition-all duration-300 ${
              isSearchOpen
                ? 'max-[578px]:absolute max-[578px]:opacity-0 max-[578px]:pointer-events-none'
                : ''
            }`}
          >
            <p className="text-2xl">MobiStuff</p>
          </Link>
        </div>

        {/* Иконки */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Поиск  под вопросо не раотает  тут ПРОБЛЕМА*/}
          <div>
            {isSearchOpen && <SearchBar setIsSearchOpen={setIsSearchOpen} />}
          </div>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="glass-icon"
          >
            {''}
            <Search className="glass-icon-svg" />
          </button>

          <Link href="/favorites" className="glass-icon">
            <Heart className="glass-icon-svg" />
          </Link>
          <Link href="/cart" className="glass-icon">
            <ShoppingCart className="glass-icon-svg" />
          </Link>

          {/* Menu */}
          <button
            onClick={() => setIsMobileSideBarOpen(true)}
            className="flex items-center gap-1 md:hidden"
          >
            <span className="menu-hamburger">Menu</span>
          </button>
        </div>
      </header>
      <MobileSidebar
        open={isMobileSideBarOpen}
        onClose={() => setIsMobileSideBarOpen(false)}
      />
    </Container>
  );
}
