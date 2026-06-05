export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 gap-3"
      aria-busy="true"
      aria-label="Завантаження"
    >
      <span className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Завантаження...</p>
    </div>
  );
}
