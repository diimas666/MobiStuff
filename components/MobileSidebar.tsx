'use client';

import { useEffect, useState } from 'react';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import CategoryList from './CategoryList';
import FilterBar from './FilterBar';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export default function MobileSidebar() {
  const { isOpen, close } = useMobileSidebar();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="mobile-sidebar-panel absolute left-0 top-0 h-full w-[85%] max-w-[340px] p-5 shadow-2xl border-r border-white/10 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-gradient-to-b from-green-400 to-green-600 shrink-0" />
            <h3 className="text-lg font-bold text-white">Каталог</h3>
          </div>
          <button
            onClick={close}
            className="glass-icon w-9 h-9"
            aria-label="Закрити меню"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <CategoryList onClose={close} variant="dark" />

        <div className="border-t border-white/10 pt-4 mt-4">
          <button
            className="flex justify-between items-center w-full text-sm font-semibold text-white py-2 px-2 rounded-xl hover:bg-white/10 transition"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <span>Фільтри</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4 text-green-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-4">
              <FilterBar variant="dark" />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
