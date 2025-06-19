'use client';

import { useState, useRef } from 'react';
import { catalogCategory } from '@/data/catalogCategory';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CategoryList() {
  const [active, setActive] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = (title: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActive(title);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActive(null), 200);
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
            <div className="flex items-center justify-between py-2 px-2 rounded cursor-pointer group-hover:bg-gray-300">
              <div className="flex gap-3">
                <category.icon className="w-5 h-5 text-gray-900" />
                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  {category.title}
                </h4>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </div>
            {active === category.title && (
              <ul
                className="absolute top-0 left-full ml-2 bg-white border shadow-md rounded p-3 space-y-1 w-56 z-20"
                onMouseEnter={() => handleEnter(category.title)}
                onMouseLeave={handleLeave}
              >
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory.slug}>
                    <Link
                      href={`/category/${category.slug}${subcategory.slug}`}
                      className="text-md rounded-md  text-gray-700 group-hover:bg-gray-300 hover:underline block pb-1"
                    >
                      <span className="pl-4">{subcategory.title}</span>
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
