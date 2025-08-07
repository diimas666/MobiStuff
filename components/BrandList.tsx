// import Image from 'next/image';
import Link from 'next/link';
import { brands } from '@/data/brands';

export default function BrandList() {
  return (
    <ul className="md:grid md:grid-cols-4 gap-1 flex overflow-x-auto whitespace-nowrap ">
      {brands.map((brand) => (
        <li key={brand.id} className="inline-block md:block min-w-[120px] px-1">
          <Link href={`/brand/${brand.handle}`} className="block text-center">
            {/* <div className="relative w-full h-20  rounded-md overflow-hidden ">
              <Image
                src={brand.image}
                alt={brand.title}
                fill
                unoptimized // <== ВАЖНО
                className="object-contain"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 15vw"
              />
            </div> */}
            <div className="relative w-full h-20 rounded-md overflow-hidden">
              <img
                src={brand.image}
                alt={brand.title}
                className="object-contain w-full h-full absolute inset-0"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
