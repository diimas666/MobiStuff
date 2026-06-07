'use client';

import { useEffect, useState, useRef } from 'react';
import { catalogCategory } from '@/data/catalogCategory';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  onClose?: () => void;
  variant?: 'light' | 'dark';
}

export default function CategoryList({ onClose, variant = 'light' }: Props) {
  const isDark = variant === 'dark';
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

  const rowClass = isDark
    ? 'flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition hover:bg-white/10'
    : 'flex items-center justify-between py-2 px-2 rounded cursor-pointer group-hover:bg-gray-300';

  const iconClass = isDark ? 'w-5 h-5 text-green-400 shrink-0' : 'w-5 h-5 text-gray-900';
  const titleClass = isDark
    ? 'font-semibold text-sm text-white flex items-center gap-2'
    : 'font-semibold text-sm text-gray-800 flex items-center gap-2';
  const chevronClass = isDark
    ? 'w-4 h-4 text-gray-400 transition-transform'
    : 'w-5 h-5 text-gray-900 transition-transform';
  const subListClass = isMobile
    ? isDark
      ? 'ml-3 pl-3 py-1 space-y-0.5 border-l border-white/10'
      : 'px-4 py-2 space-y-1'
    : 'absolute top-0 left-full ml-2 bg-white shadow-md rounded p-3 space-y-1 w-56 z-20';
  const subLinkClass = isDark
    ? 'text-sm text-gray-300 block py-2 px-2 rounded-lg hover:text-green-400 hover:bg-white/5 transition'
    : 'text-md text-gray-700 block py-1 hover:underline';

  return (
    <div className="relative w-full">
      <ul className={`relative z-10 ${isDark ? 'space-y-0.5' : 'space-y-1'}`}>
        {catalogCategory.map((category) => (
          <li
            key={category.title}
            className="relative group"
            onMouseEnter={() => handleEnter(category.title)}
            onMouseLeave={handleLeave}
          >
            <div
              className={`${rowClass} ${
                isDark && active === category.title ? 'bg-white/10' : ''
              }`}
              onClick={() => handleClick(category.title)}
            >
              <div className="flex gap-3 items-center min-w-0">
                <category.icon className={iconClass} />
                <h4 className={titleClass}>{category.title}</h4>
              </div>
              {isMobile ? (
                <ChevronDown
                  className={`${chevronClass} ${
                    active === category.title ? 'rotate-180 text-green-400' : ''
                  }`}
                />
              ) : (
                <ChevronRight className={chevronClass.replace('w-4 h-4', 'w-5 h-5')} />
              )}
            </div>

            {active === category.title && (
              <ul className={subListClass}>
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory.slug}>
                    <Link
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className={subLinkClass}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                    >
                      <h4
                        className={
                          isDark
                            ? 'font-medium text-sm'
                            : 'font-semibold text-sm text-gray-800 flex items-center gap-2'
                        }
                      >
                        {subcategory.title}
                      </h4>
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
