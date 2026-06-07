'use client';

import ProductImage from '@/components/ProductImage';
import { useState } from 'react';

interface GalleryImagesProps {
  images: string[];
  title: string;
}

export default function GalleryImages({ images, title }: GalleryImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full">
      {/* Главное изображение */}
      <div className="relative w-full rounded-xl overflow-hidden mb-4 bg-white border border-gray-100 shadow-sm">
        <ProductImage
          src={images[activeIndex]}
          alt={`${title} зображення ${activeIndex + 1}`}
          width={600}
          height={400}
          sizes="(max-width: 768px) 100vw, 600px"
          className="w-full h-auto object-contain transition-transform duration-200 hover:scale-110"
          priority
        />
      </div>

      {/* Превьюшки */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1">
        {images.map((image, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Показати зображення ${index + 1}`}
              aria-pressed={isActive}
              className={`flex-shrink-0 rounded-lg overflow-hidden w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 transition-all duration-200 box-border ${
                isActive
                  ? 'border-2 border-green-500 opacity-100'
                  : 'border-2 border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <ProductImage
                src={image}
                alt={`${title} превью ${index + 1}`}
                width={96}
                height={96}
                sizes="96px"
                loading="lazy"
                className="object-cover w-full h-full"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
