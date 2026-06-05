import Image from 'next/image';
import Link from 'next/link';

interface ItemProps {
  title: string;
  image: string;
  bg: string;
  categorySlug: string;
  subcategorySlug: string;
  priority?: boolean;
}

export default function CategoryItem({
  title,
  image,
  bg,
  categorySlug,
  subcategorySlug,
  priority = false,
}: ItemProps) {
  return (
    <Link
      href={`/category/${categorySlug}/${subcategorySlug}`}
      className={`
      relative h-full min-h-[140px] overflow-hidden
      py-2 px-4 rounded-md shadow-md
      ${bg} hover:scale-101 transition
      transform-gpu will-change-transform
      max-[578px]:aspect-square max-[578px]:min-w-[140px] max-[578px]:max-w-[160px]
      max-[578px]:flex-shrink-0 max-[578px]:h-auto max-[578px]:snap-start
  `}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 578px) 180px, (max-width: 890px) 33vw, 250px"
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
      />

      <div className="absolute inset-0 bg-black/30 flex items-end p-2">
        <h3 className="text-md font-semibold text-white ">{title}</h3>
      </div>
    </Link>
  );
}
