'use client';

import { useState } from 'react';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16 relative">
        {/* Левая часть: логотип + поиск */}
        <div className="flex items-center flex-1 relative transition-all">
          {/* ЛОГОТИП — исчезает при isSearchOpen */}
          <Link
            href="/"
            className={`text-lg font-bold text-gray-900 transition-all duration-300 ${
              isSearchOpen
                ? 'max-[578px]:opacity-0 max-[578px]:w-0 overflow-hidden'
                : ''
            }`}
          >
            MobiStuff
          </Link>

          {/* Поиск — встроен, анимировано появляется */}
          <SearchBar />
        </div>

        {/* Иконки */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Поиск — только на мобилке */}
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
          <button className="flex items-center gap-1 md:hidden">
            <span className="menu-hamburger">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
