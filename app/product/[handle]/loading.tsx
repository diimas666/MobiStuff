export default function ProductLoading() {
  return (
    <div aria-busy="true" aria-label="Завантаження товару">
      <div className="text-sm mb-4 flex gap-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-4" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>

      <p className="text-sm text-green-600 mb-6 flex items-center gap-2">
        <span className="inline-block h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        Завантаження товару...
      </p>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-28" />
              <div className="h-10 bg-gray-200 rounded w-36" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
