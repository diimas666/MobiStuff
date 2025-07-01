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
    slug: toSlug('Автомобільна тематика'),
    seoTitle: 'Купити автомобільна тематика | MobiStuff',
    seoDescription:
      'Широкий вибір: Тримачі, Зарядки, FM-модулятори – у категорії «Автомобільна тематика». Швидка доставка по Україні.',
    subcategories: ['Тримачі', 'Зарядки', 'FM-модулятори'],
  },
  {
    title: 'Акумулятори та PowerBank',
    icon: BatteryCharging,
    slug: toSlug('Акумулятори та PowerBank'),
    seoTitle: 'Купити акумулятори та PowerBank | MobiStuff',
    seoDescription:
      'Великий вибір павербанків, сонячних батарей і мережевих зарядок. Швидка доставка!',
    subcategories: ['Павербанки', 'Сонячні', 'Мережеві зарядки'],
  },
  {
    title: 'Аудіо та відео',
    icon: Volume2,
    slug: toSlug('Аудіо та відео'),
    seoTitle: 'Купити аудіо та відео аксесуари | MobiStuff',
    seoDescription:
      'Колонки, підсилювачі, Bluetooth-адаптери — широкий вибір для якісного звуку.',
    subcategories: ['Колонки', 'Підсилювачі', 'Bluetooth-адаптери'],
  },
  {
    title: 'Гаджети',
    icon: Watch,
    slug: toSlug('Гаджети'),
    seoTitle: 'Купити гаджети | MobiStuff',
    seoDescription:
      'Смарт-годинники, трекери, камери — актуальні гаджети для вас.',
    subcategories: ['Смарт-годинники', 'Трекери', 'Камери'],
  },
  {
    title: 'Зарядки та кабелі',
    icon: Plug,
    slug: toSlug('Зарядки та кабелі'),
    seoTitle: 'Купити зарядки та кабелі | MobiStuff',
    seoDescription:
      'USB-C, Lightning, MicroUSB — якісні кабелі та зарядки для будь-яких пристроїв.',
    subcategories: ['USB-C', 'Lightning', 'MicroUSB', 'Магнітні'],
  },
  {
    title: "Комп'ютерна периферія",
    icon: MonitorSmartphone,
    slug: toSlug("Комп'ютерна периферія"),
    seoTitle: 'Купити комп’ютерну периферію | MobiStuff',
    seoDescription:
      'Мишки, клавіатури, хаби — зручні пристрої для роботи та розваг.',
    subcategories: ['Мишки', 'Клавіатури', 'Хаби'],
  },
  {
    title: 'Навушники',
    icon: Headphones,
    slug: toSlug('Навушники'),
    seoTitle: 'Купити навушники | MobiStuff',
    seoDescription:
      'Великий вибір навушників – дротові, Bluetooth, TWS. Доставка по Україні.',
    subcategories: ['TWS', 'Провідні', 'З мікрофоном'],
  },
  {
    title: 'Чохли',
    icon: Smartphone,
    slug: toSlug('Чохли'),
    seoTitle: 'Купити чохли для смартфонів | MobiStuff',
    seoDescription:
      'Силіконові чохли для iPhone та Android. Захист та стиль вашого пристрою.',
    subcategories: ['Для iPhone', 'Для Android', 'Силіконові'],
  },
  {
    title: 'Корисні аксесуари',
    icon: Puzzle,
    slug: toSlug('Корисні аксесуари'),
    seoTitle: 'Купити корисні аксесуари | MobiStuff',
    seoDescription:
      'Органайзери, кабель-тестери, підставки — все для зручності та порядку.',
    subcategories: ['Кабель-тестери', 'Органайзери', 'Підставки'],
  },
  {
    title: 'Захист екрану',
    icon: Shield,
    slug: toSlug('Захист екрану'),
    seoTitle: 'Купити захист екрану | MobiStuff',
    seoDescription:
      'Плівки, захисне скло, антишпигун — збережіть ваш екран як новий.',
    subcategories: ['Плівки', 'Захисне скло', 'Антишпигун'],
  },
].map((item) => ({
  ...item,
  subcategories: item.subcategories.map((title) => {
    const slug = toSlug(title);
    return {
      title,
      slug,
      seoTitle: `${title} – ${item.title} | MobiStuff`,
      seoDescription: `Купити «${title}» у категорії «${item.title}». Великий вибір, знижки та новинки на MobiStuff.`,
    };
  }),
}));
