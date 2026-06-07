'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, MapPin, Package } from 'lucide-react';
import {
  fetchCities,
  fetchWarehouses,
  type NovaCity,
  type NovaWarehouse,
} from '@/lib/novaposhta';

export interface NovaPoshtaSelection {
  cityRef: string;
  cityLabel: string;
  warehouse: string;
}

interface NovaPoshtaDeliveryProps {
  value: NovaPoshtaSelection;
  onChange: (value: NovaPoshtaSelection) => void;
}

export default function NovaPoshtaDelivery({ value, onChange }: NovaPoshtaDeliveryProps) {
  const [cityInput, setCityInput] = useState(value.cityLabel || '');
  const [cities, setCities] = useState<NovaCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [warehouseInput, setWarehouseInput] = useState(value.warehouse || '');
  const [warehouses, setWarehouses] = useState<NovaWarehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(false);

  const cityWrapRef = useRef<HTMLDivElement>(null);
  const warehouseWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityWrapRef.current && !cityWrapRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (warehouseWrapRef.current && !warehouseWrapRef.current.contains(e.target as Node)) {
        setWarehouseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!cityOpen || cityInput.trim().length < 1) {
      setCities([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setCitiesLoading(true);
      const result = await fetchCities(cityInput);
      setCities(result);
      setCitiesLoading(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [cityInput, cityOpen]);

  useEffect(() => {
    if (!value.cityRef || !warehouseOpen || warehouseInput.trim().length < 1) {
      setWarehouses([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setWarehousesLoading(true);
      const result = await fetchWarehouses(value.cityRef, warehouseInput);
      setWarehouses(result);
      setWarehousesLoading(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [value.cityRef, warehouseInput, warehouseOpen]);

  const selectCity = (city: NovaCity) => {
    const label = `${city.Description} (${city.AreaDescription})`;
    setCityInput(city.Description);
    setCityOpen(false);
    setCities([]);
    setWarehouseInput('');
    setWarehouses([]);
    onChange({ cityRef: city.Ref, cityLabel: label, warehouse: '' });
  };

  const selectWarehouse = (item: NovaWarehouse) => {
    setWarehouseInput(item.Description);
    setWarehouseOpen(false);
    setWarehouses([]);
    onChange({ ...value, warehouse: item.Description });
  };

  const clearCity = () => {
    setCityInput('');
    setCities([]);
    setWarehouseInput('');
    setWarehouses([]);
    onChange({ cityRef: '', cityLabel: '', warehouse: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-500 bg-green-50/50">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src="/images/poshta.png"
            alt="Нова Пошта"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Нова Пошта</p>
          <p className="text-xs text-gray-500">Доставка на відділення по всій Україні</p>
        </div>
      </div>

      <div ref={cityWrapRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Місто <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityOpen(true);
              if (value.cityRef) {
                onChange({ cityRef: '', cityLabel: '', warehouse: '' });
                setWarehouseInput('');
              }
            }}
            onFocus={() => setCityOpen(true)}
            placeholder="Почніть вводити назву міста"
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
          />
          {cityInput && (
            <button
              type="button"
              onClick={clearCity}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Очистити місто"
            >
              ×
            </button>
          )}
        </div>

        {cityOpen && (cityInput.trim().length > 0 || citiesLoading) && (
          <ul className="absolute z-30 w-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
            {citiesLoading ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Пошук міст...
              </li>
            ) : cities.length > 0 ? (
              cities.map((city) => (
                <li key={city.Ref}>
                  <button
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition"
                  >
                    <span className="font-medium text-gray-900">{city.Description}</span>
                    <span className="text-gray-400 ml-1">({city.AreaDescription})</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500">Місто не знайдено</li>
            )}
          </ul>
        )}

        {value.cityLabel && (
          <p className="mt-1.5 text-xs text-green-700">Обрано: {value.cityLabel}</p>
        )}
      </div>

      <div ref={warehouseWrapRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Відділення <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={warehouseInput}
            onChange={(e) => {
              setWarehouseInput(e.target.value);
              setWarehouseOpen(true);
              onChange({ ...value, warehouse: '' });
            }}
            onFocus={() => value.cityRef && setWarehouseOpen(true)}
            placeholder={
              value.cityRef
                ? 'Введіть номер або адресу відділення'
                : 'Спочатку оберіть місто'
            }
            disabled={!value.cityRef}
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {warehouseOpen && value.cityRef && warehouseInput.trim().length > 0 && (
          <ul className="absolute z-30 w-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
            {warehousesLoading ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Пошук відділень...
              </li>
            ) : warehouses.length > 0 ? (
              warehouses.map((item) => (
                <li key={item.Ref}>
                  <button
                    type="button"
                    onClick={() => selectWarehouse(item)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition text-gray-800"
                  >
                    {item.Description}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500">Відділення не знайдено</li>
            )}
          </ul>
        )}

        {value.warehouse && (
          <p className="mt-1.5 text-xs text-green-700 line-clamp-2">Обрано: {value.warehouse}</p>
        )}
      </div>
    </div>
  );
}
