'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '@/interface/product';

interface TrendingSliderProps {
  products: Product[];
}

export default function TrendingSlider({ products }: TrendingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
// 🔁 Автоматическое переключение каждые 5 секунды
  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };
  if (!products || products.length === 0) return null;
  const currentProduct = products[currentIndex];

  

  return (
    <div className="relative w-full h-[370px] overflow-hidden rounded-xl shadow-xl">
      <Link
        href={`/product/${currentProduct.handle}`}
        className="block w-full h-full"
      >
        <div className="relative w-full h-full">
          <Image
            src={currentProduct.image}
            alt={currentProduct.title}
            fill
            sizes="(max-width: 768px) 90vw, 50vw"
            className="object-cover w-full h-full rounded-xl transition-all duration-900 ease-in-out "
            priority
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-4">
          <h3 className="text-lg font-semibold mb-1">{currentProduct.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
              {currentProduct.price} грн
            </span>
            <span className="bg-yellow-400 text-black text-xs px-3 py-1 rounded">
              Придбати
            </span>
          </div>
        </div>
      </Link>

      {/* Стрелки */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
      >
        ❮
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
      >
        ❯
      </button>
    </div>
  );
}
