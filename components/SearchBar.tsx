'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
interface SearchBarProps {
  setIsSearchOpen: (open: boolean) => void;
}
interface Product {
  id: string;
  title: string;
  handle: string;
  image: string;
}

export default function SearchBar({ setIsSearchOpen }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length > 1) {
        fetch(`/api/search?q=${encodeURIComponent(search.trim())}`)
          .then((res) => {
            if (!res.ok) throw new Error('Не вдалося отримати товари');
            return res.json();
          })
          .then((data: Product[]) => {
            setResults(data);
            setError(null);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error('Помилка пошуку:', err);
            setError('Помилка пошуку');
            setResults([]);
            setShowDropdown(false);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelect = (handle: string) => {
    setSearch('');
    setShowDropdown(false);
    router.push(`/product/${handle}`);
  };
  // функция маркер
  function highlightMatch(text: string, keyword: string) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) {
            handleSelect(results[0].handle);
          }
        }}
        className="search-bar"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук товарів..."
          className="search-input max-[468px]:w-24  min-[768px]:w-full"
          onFocus={() => setShowDropdown(results.length > 0)}
          autoComplete="off"
        />
        <XCircle
          className="w-5 h-5  ml-auto"
          onClick={() => setIsSearchOpen(false)}
        />
      </form>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-transparent dark:bg-black rounded-xl shadow-md backdrop-blur-sm">
          {error && (
            <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {!error && results.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 w-full ">
              Нічого не знайдено
            </div>
          )}
          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product.handle)}
              className="flex items-center justify-between px-4 py-2 gap-3 cursor-pointer 
             hover:bg-gray-100 dark:hover:bg-gray-800 text-sm 
             max-[490px]:relative max-[490px]:top-5 max-[490px]:w-[350px] bg-white rounded-2xl shadow-md mb-1 "
            >
              <div className="flex-1 ">
                <p className="text-gray-800 dark:text-white ">
                  {highlightMatch(
                    product.title.length > 50
                      ? `${product.title.slice(0, 50)}…`
                      : product.title,
                    search
                  )}
                </p>
              </div>
              {product.image && (
                <div className="relative w-12 h-12">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
