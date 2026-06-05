interface ProductGridSkeletonProps {
  count?: number;
  cols?: 1 | 2;
}

export default function ProductGridSkeleton({
  count = 8,
  cols = 2,
}: ProductGridSkeletonProps) {
  const gridClass =
    cols === 2
      ? 'grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
      : 'grid-cols-1';

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border rounded-xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 sm:p-4 bg-gray-800 space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full" />
            <div className="h-3 bg-gray-600 rounded w-4/5" />
            <div className="flex justify-between pt-2">
              <div className="h-6 bg-gray-600 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-gray-600 rounded-full" />
                <div className="h-9 w-9 bg-gray-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
