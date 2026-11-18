import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductImage from '@/components/ProductImage';
import { Product } from '@/interface/product';

const fallback = [
  '/images/headphones-bg-white.webp',
  '/images/cifrovoe-ustroistvo-black-power-bank.webp',
  '/images/usb-koncentratory-cifrovye-ustroistva.webp',
];

export default function HomeHero({ products = [] }: { products?: Product[] }) {
  const picks = products.filter((p) => p.image).slice(0, 3);
  const images = picks.length === 3 ? picks.map((p) => ({ src: p.image, alt: p.title, href: `/product/${p.handle}` })) : fallback.map((src) => ({ src, alt: '', href: '/catalog' }));

  // висота та зсув кожної «картки» товару — ритм, як на вітрині
  const layout = [
    'w-[30%] -rotate-[5deg] translate-y-6 sm:translate-y-10',
    'w-[38%] z-10',
    'w-[30%] rotate-[5deg] translate-y-6 sm:translate-y-10',
  ];

  return (
    <section className="panel relative overflow-hidden px-5 pt-12 pb-0 text-center sm:px-10 sm:pt-20">
      <h1 className="display-xl rise mx-auto max-w-4xl" style={{ '--d': '60ms' } as React.CSSProperties}>
        Аксесуари, які просто працюють.
      </h1>
      <p className="lead rise mx-auto mt-5 max-w-xl" style={{ '--d': '180ms' } as React.CSSProperties}>
        Навушники, павербанки, кабелі й чохли від перевірених брендів. Відправляємо Новою Поштою за 1–3 дні.
      </p>
      <div
        className="rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        style={{ '--d': '300ms' } as React.CSSProperties}
      >
        <Link href="/catalog" className="btn-primary btn-lg">
          Перейти до каталогу
        </Link>
        <Link href="#hits" className="link-more text-[17px]">
          Хіти продажу
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-3xl items-end justify-center gap-2 sm:mt-16 sm:gap-5">
        {images.map((img, i) => (
          <Link
            key={img.src}
            href={img.href}
            aria-label={img.alt || 'Каталог'}
            className={`rise ${layout[i]} shrink-0`}
            style={{ '--d': `${420 + i * 120}ms` } as React.CSSProperties}
          >
            <div className="float-y" style={{ '--fd': `${i * 900}ms` } as React.CSSProperties}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-[28px] bg-canvas shadow-[0_-10px_40px_-20px_rgb(0_0_0/0.25)]">
                <ProductImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority
                  sizes="(max-width: 640px) 40vw, 300px"
                  className="object-contain p-4 mix-blend-multiply sm:p-8"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
