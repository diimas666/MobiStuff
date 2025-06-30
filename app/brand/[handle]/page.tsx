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
      <div className="relative w-full h-[200px] block ">
        <Image
          src={brand.imageFull}
          alt={brand.title}
          fill
          sizes="100wv"
          className="object-contain"
        />
      </div>
      <h1>Ви потрапили на сторінку бренду :{brand.title}</h1>
      {brand.description && (
        <p className="text-gray-600 mb-6">{brand.description}</p>
      )}
      <div>
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
