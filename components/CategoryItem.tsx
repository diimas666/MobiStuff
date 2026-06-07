import Link from 'next/link';
import ProductImage from '@/components/ProductImage';

interface ItemProps {
  title: string;
  image: string;
  categorySlug: string;
  subcategorySlug: string;
  priority?: boolean;
  imageFit?: 'cover' | 'contain';
}

export default function CategoryItem({
  title,
  image,
  categorySlug,
  subcategorySlug,
  priority = false,
  imageFit = 'contain',
}: ItemProps) {
  const isCover = imageFit === 'cover';

  if (isCover) {
    return (
      <Link
        href={`/category/${categorySlug}/${subcategorySlug}`}
        className="
          group relative block overflow-hidden rounded-xl shadow-md h-full w-full
          min-h-[130px]
          max-[578px]:aspect-square max-[578px]:min-w-[140px] max-[578px]:max-w-[160px]
          max-[578px]:flex-shrink-0 max-[578px]:h-auto max-[578px]:snap-start
        "
      >
        <ProductImage
          src={image}
          alt={title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 578px) 160px, (max-width: 1024px) 33vw, 280px"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
        <div className="absolute inset-0 bg-black/35 flex items-end p-2 sm:p-3">
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/category/${categorySlug}/${subcategorySlug}`}
      className="
        group relative flex flex-col overflow-hidden rounded-xl border border-gray-100
        bg-white shadow-sm hover:shadow-md transition-shadow
        aspect-[4/3] w-full
        max-[578px]:min-w-[148px] max-[578px]:max-w-[168px] max-[578px]:flex-shrink-0 max-[578px]:snap-start
      "
    >
      <div className="relative flex-1 min-h-0 bg-white">
        <div className="absolute inset-0 p-3 sm:p-4 pb-1">
          <div className="relative h-full w-full">
            <ProductImage
              src={image}
              alt={title}
              fill
              className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 578px) 160px, (max-width: 1024px) 25vw, 220px"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-2.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
          {title}
        </h3>
      </div>
    </Link>
  );
}
