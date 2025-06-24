'use client';

import { useEffect, useState, useRef } from 'react';
import { catalogCategory } from '@/data/catalogCategory';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export default function CategoryList({ onClose }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEnter = (title: string) => {
    if (!isMobile) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setActive(title);
    }
  };

  const handleLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => setActive(null), 200);
    }
  };

  const handleClick = (title: string) => {
    if (isMobile) {
      setActive((prev) => (prev === title ? null : title));
    }
  };

  return (
    <div className="relative w-full">
      <ul className="space-y-1 relative z-10">
        {catalogCategory.map((category) => (
          <li
            key={category.title}
            className="relative group"
            onMouseEnter={() => handleEnter(category.title)}
            onMouseLeave={handleLeave}
          >
            <div
              className="flex items-center justify-between py-2 px-2 rounded cursor-pointer group-hover:bg-gray-300"
              onClick={() => handleClick(category.title)}
            >
              <div className="flex gap-3">
                <category.icon className="w-5 h-5 text-gray-900" />
                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  {category.title}
                </h4>
              </div>
              {isMobile ? (
                <ChevronDown
                  className={`w-5 h-5 text-gray-900 transition-transform ${
                    active === category.title ? 'rotate-180' : ''
                  }`}
                />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-900" />
              )}
            </div>

            {active === category.title && (
              <ul
                className={`${
                  isMobile
                    ? 'px-4 py-2 space-y-1'
                    : 'absolute top-0 left-full ml-2 bg-white border shadow-md rounded p-3 space-y-1 w-56 z-20'
                }`}
              >
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory.slug}>
                    <Link
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className="text-md text-gray-700 block py-1 hover:underline"
                      onClick={() => {
                        // Закрываем меню только при клике по подкатегории
                        if (onClose) onClose();
                      }}
                    >
                      {subcategory.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
