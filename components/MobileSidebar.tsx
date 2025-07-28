'use client';

import { useEffect, useState } from 'react';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import CategoryList from './CategoryList';
import FilterBar from './FilterBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MobileSidebar() {
  const { isOpen, close } = useMobileSidebar();
  const [showFilters, setShowFilters] = useState(false); // 👈 состояние аккордеона

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 h-full w-3/4 max-w-[320px] bg-white p-4 shadow-lg overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Каталог</h3>
        </div>

        {/* Категории */}
        <CategoryList onClose={close} />

        {/* Фильтры с аккордеоном */}
        <div className="border-t pt-4 mt-4">
          <button
            className="flex justify-between items-center w-full text-md font-medium mb-2"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <span>Фільтри</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showFilters && (
            <div className="mt-2">
              <FilterBar />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
