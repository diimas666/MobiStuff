'use client';

import ProductImage from '@/components/ProductImage';
import { useEffect, useRef, useState } from 'react';

interface GalleryImagesProps {
  images: string[];
  title: string;
}

export default function GalleryImages({ images, title }: GalleryImagesProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const list = (images ?? []).filter(Boolean);

  // синхронізація свайпу (мобільний) з активною мініатюрою
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActive((prev) => (prev === i ? prev : i));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (list.length === 0) return null;

  const goTo = (i: number) => {
    setActive(i);
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="panel relative overflow-hidden">
        <div ref={trackRef} className="shelf aspect-square">
          {list.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full w-full shrink-0 p-8 sm:p-14">
              <div className="relative h-full w-full">
                <ProductImage
                  src={src}
                  alt={`${title} — фото ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-contain"
                  priority={i === 0}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>

        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
            {list.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 bg-ink' : 'w-1.5 bg-ink/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto lg:flex">
          {list.map((src, i) => (
            <button
              key={`${src}-thumb-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Показати фото ${i + 1}`}
              aria-pressed={i === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white p-2 transition ${
                i === active ? 'ring-2 ring-ink' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <span className="relative block h-full w-full">
                <ProductImage src={src} alt="" fill sizes="80px" loading="lazy" className="object-contain" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
