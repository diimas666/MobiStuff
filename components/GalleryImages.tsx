'use client';

import Image from 'next/image';
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
      <div className="relative w-full rounded overflow-hidden mb-4">
        <Image
          src={images[activeIndex]}
          alt={`${title} зображення ${activeIndex + 1}`}
          width={600}
          height={400}
          className="w-full h-auto object-contain transition-transform duration-200 hover:scale-110"
          priority
        />
      </div>

      {/* Превьюшки */}
      <div className="flex justify-between md:justify-normal md:gap-2 overflow-x-auto scrollbar-thin ">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex-shrink-0 border rounded overflow-hidden w-24 h-24 ${
              activeIndex === index ? 'ring-2 ring-black' : ''
            }`}
          >
            {''}
            <Image
              src={image}
              alt={`${title} превью ${index + 1}`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
