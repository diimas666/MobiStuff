import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import type { StorePromotion } from '@/lib/storefront';

/** Акційні картки з адмінки: колір/фото, заголовок, підзаголовок, кнопка */
export default function PromoCards({ promotions }: { promotions: StorePromotion[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
      {promotions.map((p, i) => (
        <Link
          key={p.id}
          href={p.href}
          className="group relative flex aspect-[4/3] w-[82%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[22px] p-6 text-white sm:w-auto sm:p-7"
          style={{ backgroundColor: p.color || '#1d1d1f' }}
        >
          {p.imageUrl ? (
            <>
              <Image
                src={p.imageUrl}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 82vw, 33vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
            </>
          ) : (
            <span aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 text-[150px] leading-none opacity-90 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:rotate-[-6deg] sm:text-[170px]">
              {p.emoji}
            </span>
          )}
          <div className="relative">
            {p.subtitle ? <p className="text-[14px] font-medium text-white/75">{p.subtitle}</p> : null}
            <h3 className="mt-1 max-w-[80%] text-[26px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[30px]">{p.title}</h3>
          </div>
          <span className="relative inline-flex w-fit items-center gap-0.5 rounded-full bg-white/95 px-4 py-2 text-[14px] font-medium text-ink transition group-hover:bg-white">
            {p.cta || 'Дивитися'}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
