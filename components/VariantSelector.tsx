'use client';

interface VariantSelectorProps {
  variants: string[];
  selected: string | null;
  setSelected: (variant: string) => void;
}

export default function VariantSelector({ variants, selected, setSelected }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-semibold">
        Варіант{selected ? <span className="font-normal text-ink-2"> — {selected}</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isActive = selected === variant;
          return (
            <button
              key={variant}
              type="button"
              onClick={() => setSelected(variant)}
              aria-pressed={isActive}
              className={`min-w-[88px] rounded-xl border px-4 py-3 text-sm font-medium transition ${
                isActive ? 'border-accent bg-accent-soft text-ink ring-1 ring-accent' : 'border-line bg-white hover:border-ink-3'
              }`}
            >
              {variant}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
