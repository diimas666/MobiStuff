import Image from 'next/image';
import Link from 'next/link';
import { brands } from '@/data/brands';

/** Безкінечна стрічка логотипів брендів (зупиняється при наведенні). */
export default function BrandList() {
  const loop = [...brands, ...brands];

  return (
    <div className="marquee relative -mx-4 overflow-hidden sm:-mx-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className="marquee-track flex w-max gap-3 py-1 sm:gap-4">
        {loop.map((brand, i) => (
          <li key={`${brand.id}-${i}`} aria-hidden={i >= brands.length || undefined}>
            <Link
              href={`/brand/${brand.handle}`}
              tabIndex={i >= brands.length ? -1 : undefined}
              className="tile tile-hover flex h-24 w-40 items-center justify-center px-6 sm:h-28 sm:w-48"
              aria-label={brand.title}
            >
              <span className="relative h-full w-full">
                <Image
                  src={brand.image}
                  alt={brand.title}
                  fill
                  className="object-contain"
                  sizes="192px"
                  loading="lazy"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
