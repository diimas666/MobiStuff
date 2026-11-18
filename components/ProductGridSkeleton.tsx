interface ProductGridSkeletonProps {
  count?: number;
  cols?: 1 | 2;
}

export default function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="tile animate-pulse overflow-hidden">
          <div className="m-5 aspect-square rounded-2xl bg-canvas" />
          <div className="space-y-2 px-5 pb-5">
            <div className="h-3 w-1/3 rounded-full bg-canvas" />
            <div className="h-4 w-full rounded-full bg-canvas" />
            <div className="h-4 w-2/3 rounded-full bg-canvas" />
            <div className="flex items-center justify-between pt-3">
              <div className="h-5 w-20 rounded-full bg-canvas" />
              <div className="h-10 w-10 rounded-full bg-canvas" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
