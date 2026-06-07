interface HomeSectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function HomeSectionTitle({ title, subtitle }: HomeSectionTitleProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-3">
        <span className="w-1 h-7 sm:h-8 rounded-full bg-gradient-to-b from-green-400 to-green-600 shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1 ml-4">{subtitle}</p>}
    </div>
  );
}
