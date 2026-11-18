import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function CategoryLoading() {
  return (
    <div aria-busy="true" aria-label="Завантаження категорії" className="animate-pulse">
      <div className="mb-5 h-3 w-56 rounded-full bg-line-soft" />
      <div className="mb-3 h-12 w-2/3 max-w-md rounded-2xl bg-line-soft" />
      <div className="mb-8 h-4 w-40 rounded-full bg-line-soft" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-white" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        <div className="panel hidden h-96 md:block" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
