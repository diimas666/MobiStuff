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

  return (
    <div className="h-[60px] ">
      <ul className="flex  gap-4 justify-center ">
        {variants.map((variant, index) => (
          <li
            key={index}
            onClick={() => setSelected(variant)}
            className={` min-w-[80px] py-2 px-4 rounded-4xl shadow-md flex items-center justify-center text-md cursor-pointer transition ${
              selected === variant
                ? 'bg-black text-white border-black'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {variant}
          </li>
        ))}
      </ul>
    </div>
  );
}
