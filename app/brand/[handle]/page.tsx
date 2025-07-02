import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import { brands } from '@/data/brands';
import { actualProposition as products } from '@/data/actualProposition';
import CategoryList from '@/components/CategoryList';

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: { page?: string };
}) {
  const { handle } = params;
  const page = parseInt(searchParams?.page || '1', 10);
  const perPage = 20;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );

  if (!brand) return notFound();

  const filtered = products.filter(
    (p) => p.brand?.toLowerCase() === brand.title.toLowerCase()
  );

  const paginatedProducts = filtered.slice(start, end);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div>
      <div className="relative w-full min-h-[90px] max-h-[400px] overflow-hidden block mb-4">
        <Image
          src={brand.imageFull}
          alt={brand.title}
          width={1200}
          height={300}
          layout="responsive"
          className="object-cover w-full"
        />
      </div>

      <div className="flex gap-4">
        <aside className="w-[250px] hidden md:block">
          <h3 className="text-2xl font-semibold mb-2">Каталог</h3>
          <CategoryList />
        </aside>

        <section className="flex-1">
          <h1 className="font-semibold text-2xl mb-2">{brand.title}</h1>

          {Array.isArray(brand.description) &&
            brand.description.map((p, i) => (
              <p className="mb-1 text-gray-700 leading-relaxed" key={i}>
                {p}
              </p>
            ))}

          {brand.products && (
            <ul className="list-disc list-inside mt-4 space-y-1 mb-4">
              {brand.products.map((item, i) => (
                <li className="text-gray-600 ml-5" key={i}>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {paginatedProducts.length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                Товари цього бренду не знайдено.
              </p>
            )}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
              {page > 1 && (
                <a
                  href={`/brand/${handle}?page=${page - 1}`}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  ← Попередня
                </a>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .map((p, i, arr) => {
                  const prev = arr[i - 1];
                  const showDots = prev && p - prev > 1;

                  return [
                    showDots && (
                      <span key={`dots-${p}`} className="px-2">
                        ...
                      </span>
                    ),
                    <a
                      key={`page-${p}`}
                      href={`/brand/${handle}?page=${p}`}
                      className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                        page === p ? 'bg-black text-white' : 'text-black'
                      }`}
                    >
                      {p}
                    </a>,
                  ];
                })}

              {page < totalPages && (
                <a
                  href={`/brand/${handle}?page=${page + 1}`}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Наступна →
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
