'use client';
import CategoryList from './CategoryList';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}
export default function MobileSidebar({ open, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 h-full w-3/4 max-w-[300px] bg-white p-4 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Каталог</h3>
          <button onClick={onClose} className="text-sm text-gray-600">
            Закрыть
          </button>
        </div>
        <CategoryList />
      </aside>
    </div>
  );
}
