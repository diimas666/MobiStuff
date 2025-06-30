// app/brand/[handle]/page.tsx
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import { brands } from '@/data/brands'; // заменишь на свои данные
import { actualProposition as products } from '@/data/actualProposition';
interface Props {
  params: {
    handle: string;
  };
}

export default async function BrandPage({ params }: Props) {
  const { handle } = params;
  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );
  if (!brand) return notFound();
  const filtered = products.filter(
    (p) => p.brand?.toLowerCase() === brand.title.toLowerCase()
  );
  return (
    <div>
      <div className="relative w-full min-h-[90px] block ">
        <Image
          src={brand.imageFull}
          alt={brand.title}
          width={1200}
          height={300}
          layout="responsive"
          className="object-cover w-full"
        />
      </div>
      <h1 className="font-semibold text-2xl">{brand.title}</h1>
      {brand.description && (
        <p className="text-gray-600 mb-6">{brand.description}</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            Товари цього бренду не знайдено.
          </p>
        )}
      </div>
    </div>
  );
}
