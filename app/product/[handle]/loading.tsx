export default function ProductLoading() {
  return (
    <div aria-busy="true" aria-label="Завантаження товару" className="animate-pulse">
      <div className="mb-5 h-3 w-64 rounded-full bg-line-soft" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="panel aspect-square" />
        <div className="space-y-4 lg:pt-4">
          <div className="h-4 w-24 rounded-full bg-line-soft" />
          <div className="h-10 w-full rounded-2xl bg-line-soft" />
          <div className="h-10 w-2/3 rounded-2xl bg-line-soft" />
          <div className="h-8 w-36 rounded-full bg-line-soft" />
          <div className="h-[58px] w-full rounded-full bg-line-soft" />
          <div className="h-[58px] w-full rounded-full bg-white" />
          <div className="panel h-64" />
        </div>
      </div>
    </div>
  );
}
