'use client';
import ProductImage from '@/components/ProductImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '@/interface/product';
import { stripHtml } from '@/lib/htmlUtils';

interface TrendingSliderProps {
  products: Product[];
}

export default function TrendingSlider({ products }: TrendingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [products.length]);
  if (!products || products.length === 0) return null; // ⬅️ перемести СЮДА
  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[300px] overflow-hidden rounded-xl shadow-xl">
      <Link
        href={`/product/${currentProduct.handle}`}
        className="block w-full h-full"
      >
        <div className="relative aspect-[1/1] w-full h-full">
          <ProductImage
            src={currentProduct.image}
            alt={currentProduct.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover w-full h-full rounded-xl transition-all duration-900 ease-in-out"
            priority
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-1 line-clamp-2">
            {currentProduct.title}
          </h3>
          <p className="text-sm text-gray-200 line-clamp-1 sm:line-clamp-2 mb-2">
            {stripHtml(currentProduct.description || '')}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-green-500">
              {currentProduct.price} грн
            </span>
            <span className="bg-gray-400 text-black text-xs px-3 py-1 rounded shadow-amber-300 hover:bg-yellow-500">
              Купити зараз
            </span>
          </div>
        </div>
      </Link>

      {/* Стрелки */}
      <button
        type="button"
        onClick={prev}
        className="absolute top-1/2 left-1 sm:left-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 text-sm sm:text-base shadow transition"
      >
        ❮
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute top-1/2 right-1 sm:right-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 text-sm sm:text-base shadow transition"
      >
        ❯
      </button>
    </div>
  );
}
