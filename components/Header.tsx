'use client';
import { useState } from 'react';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import Container from './Container';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import MobileSidebar from './MobileSidebar';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { open } = useMobileSidebar(); // 🟢 Функция, вызываем

  return (
    <Container>
      <header className="glass-header sticky top-0 z-50 flex py-4">
        {/* логотип */}
        <div className="flex items-center flex-1 relative">
          <Link href="/" className="text-2xl font-bold">
            MobiStuff
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isSearchOpen && <SearchBar setIsSearchOpen={setIsSearchOpen} />}
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
          <button onClick={open} className="md:hidden menu-hamburger">
            Menu
          </button>
        </div>
      </header>

      <MobileSidebar />
    </Container>
  );
}
