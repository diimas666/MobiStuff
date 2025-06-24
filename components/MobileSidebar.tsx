'use client';
import { useEffect } from 'react';
import { useMobileSidebar } from '@/context/MobileSidebarContext';
import CategoryList from './CategoryList';

export default function MobileSidebar() {
  const { isOpen, close } = useMobileSidebar();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div onClick={close} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 h-full w-3/4 max-w-[300px] bg-white p-4 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Каталог</h3>
          <button onClick={close} className="text-sm text-gray-600">Закрыть</button>
        </div>
        <CategoryList onClose={close} />
      </aside>
    </div>
  );
}
