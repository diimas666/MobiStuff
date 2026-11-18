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
}: ItemProps) {
  return (
    <Link
      href={`/category/${categorySlug}/${subcategorySlug}`}
      className="tile tile-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3]">
        <div className="absolute inset-0 p-5">
          <div className="relative h-full w-full">
            <ProductImage
              src={image}
              alt={title}
              fill
              className="object-contain transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          </div>
        </div>
      </div>
      <h3 className="px-4 pb-4 text-[14px] font-medium leading-snug sm:text-[15px]">{title}</h3>
    </Link>
  );
}
