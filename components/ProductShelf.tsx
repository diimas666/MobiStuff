'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/interface/product';

interface ProductShelfProps {
  products: Product[];
  compact?: boolean;
  priorityCount?: number;
}

/** Горизонтальна «полиця» товарів у стилі Apple Store: scroll-snap + стрілки. */
export default function ProductShelf({ products, compact = false, priorityCount = 0 }: ProductShelfProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, products.length]);

  if (!products || products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const itemWidth = compact
    ? 'w-[44%] sm:w-[30%] md:w-[23%] lg:w-[18.4%]'
    : 'w-[70%] min-[440px]:w-[46%] sm:w-[36%] md:w-[30%] lg:w-[23.5%] xl:w-[19%]';

  const arrow =
    'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_4px_20px_rgb(0_0_0/0.12)] backdrop-blur transition-all duration-300 hover:bg-white md:flex';

  return (
    <div className="group/shelf relative -mx-4 sm:-mx-6">
      <div ref={ref} className="shelf gap-3 scroll-px-4 px-4 pt-1 pb-6 sm:gap-4 sm:scroll-px-6 sm:px-6">
        {products.map((product, i) => (
          <div key={product._id || product.id} className={`${itemWidth} shrink-0`}>
            <ProductCard product={product} compact={compact} priority={i < priorityCount} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Попередні товари"
        className={`${arrow} left-3 ${canPrev ? 'opacity-0 group-hover/shelf:opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Наступні товари"
        className={`${arrow} right-3 ${canNext ? 'opacity-0 group-hover/shelf:opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
