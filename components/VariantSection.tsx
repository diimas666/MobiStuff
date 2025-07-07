'use client';
import { Heart, ShoppingCart } from 'lucide-react';

import VariantSelector from './VariantSelector';
import { useState } from 'react';
interface Props {
  variants: string[];
}
export default function VariantSection({ variants }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border p-4">

      <VariantSelector
        variants={variants}
        selected={selected}
        setSelected={setSelected}
      />

      <div className="flex flex-col gap-2  ">
        <button className="button-block-card hover:bg-gray-200 flex items-center gap-3 py-2 px-4 justify-center ">
          {''}Додати в обране
          <Heart className="glass-icon-svg" />
        </button>
        <button className="button-block-card hover:bg-green-200 flex items-center gap-3 py-2 px-4 justify-center  ">
          {''}Купити
          <ShoppingCart className="glass-icon-svg" />
        </button>
      </div>
    </div>
  );
}
