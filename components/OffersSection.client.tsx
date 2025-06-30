'use client';
import { useState } from 'react';
import { actualProposition } from '@/data/actualProposition';
import OffersSlider from '@/components/OffersSlider';
import { Columns2, Dice1 } from 'lucide-react';

export default function OffersSection() {
  const [mobileSlidesToShow, setMobileSlideToShow] = useState(1);

  const toggleSliders = () => {
    setMobileSlideToShow((prev) => (prev === 1 ? 2 : 1));
  };
  return (
    <section className="section-bottom">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold mb-5">Актуальні пропозиції</h3>
        <button
          onClick={toggleSliders}
          className="max-[490px]:block md:hidden  "
        >
          {mobileSlidesToShow === 1 ? <Columns2 size={30}/> : <Dice1 size={30} />  }
        </button>
      </div>
      <div className="w-full overflow-hidden pb-6">
        <OffersSlider
          products={actualProposition}
          mobileSlidesToShow={mobileSlidesToShow}
        />
      </div>
    </section>
  );
}
