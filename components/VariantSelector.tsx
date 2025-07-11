'use client';

interface VariantSelectorProps {
  variants: string[];
  selected: string | null;
  setSelected: (variant: string) => void;
}

export default function VariantSelector({
  variants,
  selected,
  setSelected,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  const isMany = variants.length >= 3;

  return (
    <div>
      <ul
        className={`flex gap-3 flex-wrap ${
          isMany ? 'flex-col sm:flex-row text-sm' : 'justify-center text-base'
        }`}
      >
        {variants.map((variant, index) => (
          <li
            key={index}
            onClick={() => setSelected(variant)}
            className={`min-w-[80px] py-2 px-4 rounded-full shadow-sm flex items-center justify-center cursor-pointer transition text-center ${
              selected === variant
                ? 'bg-black text-white border border-black'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {variant}
          </li>
        ))}
      </ul>
    </div>
  );
}
