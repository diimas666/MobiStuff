import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function CategoryLoading() {
  return (
    <div aria-busy="true" aria-label="Завантаження категорії">
      <div className="text-sm mb-4 flex gap-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-4" />
        <div className="h-4 bg-gray-200 rounded w-28" />
      </div>

      <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />

      <p className="text-sm text-green-600 mb-4 flex items-center gap-2">
        <span className="inline-block h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        Завантаження товарів...
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <aside className="hidden md:block px-4 py-4 shadow-sm rounded bg-white animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </aside>

        <div className="w-full">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
