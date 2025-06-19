// data/categoryTree.ts
import { toSlug } from '@/lib/slugify';

import {
  Car,
  BatteryCharging,
  Volume2,
  Watch,
  Plug,
  MonitorSmartphone,
  Headphones,
  Smartphone,
  Puzzle,
  Shield,
} from 'lucide-react';

export const catalogCategory = [
  {
    title: 'Автомобільна тематика',
    icon: Car,
    subcategories: ['Тримачі', 'Зарядки', 'FM-модулятори'],
  },
  {
    title: 'Акумулятори та PowerBank',
    icon: BatteryCharging,
    subcategories: ['Павербанки', 'Сонячні', 'Мережеві зарядки'],
  },
  {
    title: 'Аудіо та відео',
    icon: Volume2,
    subcategories: ['Колонки', 'Підсилювачі', 'Bluetooth-адаптери'],
  },
  {
    title: 'Гаджети',
    icon: Watch,
    subcategories: ['Смарт-годинники', 'Трекери', 'Камери'],
  },
  {
    title: 'Зарядки та кабелі',
    icon: Plug,
    subcategories: ['USB-C', 'Lightning', 'MicroUSB', 'Магнітні'],
  },
  {
    title: "Комп'ютерна периферія",
    icon: MonitorSmartphone,
    subcategories: ['Мишки', 'Клавіатури', 'Хаби'],
  },
  {
    title: 'Навушники',
    icon: Headphones,
    subcategories: ['TWS', 'Провідні', 'З мікрофоном'],
  },
  {
    title: 'Чохли',
    icon: Smartphone,
    subcategories: ['Для iPhone', 'Для Android', 'Силіконові'],
  },
  {
    title: 'Корисні аксесуари',
    icon: Puzzle,
    subcategories: ['Кабель-тестери', 'Органайзери', 'Підставки'],
  },
  {
    title: 'Захист екрану',
    icon: Shield,
    subcategories: ['Плівки', 'Захисне скло', 'Антишпигун'],
  },
].map((item) => ({
  ...item,
  slug: toSlug(item.title),
  subcategories: item.subcategories.map((subcategory) => ({
    title: subcategory,
    slug: toSlug(subcategory),
  })),
}));
