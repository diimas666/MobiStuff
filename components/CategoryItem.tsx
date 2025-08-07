// components/PopularItem.tsx
// import Image from 'next/image';
import Link from 'next/link';
interface ItemProps {
  title: string;
  image: string;
  bg: string;
  categorySlug: string;
  subcategorySlug: string;
}

export default function CategoryItem({
  title,
  image,
  bg,
  categorySlug,
  subcategorySlug,
}: ItemProps) {
  return (
    <Link
      href={`/category/${categorySlug}/${subcategorySlug}`}
      className={`
      relative aspect-square overflow-hidden 
      py-2 px-4 rounded-md shadow-md 
      ${bg} hover:scale-101 transition  
      transform-gpu will-change-transform
      max-[578px]:min-w-[160px] max-[578px]:max-w-[180px] max-[578px]:flex-shrink-0
  `}
    >
      {/* <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        unoptimized
      /> */}
      <img
        src={image}
        alt={title}
        className="object-cover w-full h-full absolute inset-0"
      />

      <div className="absolute inset-0 bg-black/30 flex items-end p-2">
        <h3 className="text-md font-semibold text-white ">{title}</h3>
      </div>
    </Link>
  );
}
