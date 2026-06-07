'use client';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  variant?: 'light' | 'dark';
}

export default function PriceRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  variant = 'light',
}: PriceRangeSliderProps) {
  const isDark = variant === 'dark';
  const range = Math.max(max - min, 1);
  const minPercent = ((minValue - min) / range) * 100;
  const maxPercent = ((maxValue - min) / range) * 100;

  const handleMinChange = (value: number) => {
    onChange(Math.min(value, maxValue - 1), maxValue);
  };

  const handleMaxChange = (value: number) => {
    onChange(minValue, Math.max(value, minValue + 1));
  };

  return (
    <div className="w-full">
      <div
        className={`flex justify-between text-sm font-medium mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}
      >
        <span>{minValue} грн</span>
        <span>{maxValue} грн</span>
      </div>

      <div className="relative h-6">
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full ${
            isDark ? 'bg-white/20' : 'bg-gray-200'
          }`}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-green-500 rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent z-[3]"
          aria-label="Мінімальна ціна"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent z-[4]"
          aria-label="Максимальна ціна"
        />
      </div>
    </div>
  );
}
