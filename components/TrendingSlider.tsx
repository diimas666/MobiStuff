'use client';

import ProductImage from '@/components/ProductImage';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import Slider from 'react-slick';
import { Product } from '@/interface/product';
import { stripHtml } from '@/lib/htmlUtils';

interface TrendingSliderProps {
  products: Product[];
}

export default function TrendingSlider({ products }: TrendingSliderProps) {
  const router = useRouter();
  const dragStart = useRef<number | null>(null);
  const wasDragged = useRef(false);

  if (!products || products.length === 0) return null;

  const onDragStart = (clientX: number) => {
    dragStart.current = clientX;
    wasDragged.current = false;
  };

  const onDragMove = (clientX: number) => {
    if (dragStart.current !== null && Math.abs(clientX - dragStart.current) > 8) {
      wasDragged.current = true;
    }
  };

  const onProductClick = (handle: string) => {
    if (wasDragged.current) return;
    router.push(`/product/${handle}`);
  };

  const settings = {
    dots: false,
    arrows: false,
    infinite: products.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: products.length > 1,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    touchThreshold: 8,
  };

  return (
    <Slider {...settings} className="trending-slider h-full">
      {products.map((product) => (
        <div key={product.id || product._id} className="outline-none h-full">
          <div
            role="link"
            tabIndex={0}
            onClick={() => onProductClick(product.handle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProductClick(product.handle);
              }
            }}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onMouseDown={(e) => onDragStart(e.clientX)}
            onMouseMove={(e) => onDragMove(e.clientX)}
            className="block relative rounded-xl overflow-hidden shadow-md h-full cursor-pointer group"
          >
            <ProductImage
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-8 pt-10 sm:pb-10">
              <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 mb-1">
                {product.title}
              </h3>
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 mb-2">
                  {stripHtml(product.description)}
                </p>
              )}
              <span className="text-lg sm:text-xl font-bold text-green-400">
                {product.price} грн
              </span>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
}
