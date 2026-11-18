export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32" aria-busy="true" aria-label="Завантаження">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-ink" />
    </div>
  );
}
