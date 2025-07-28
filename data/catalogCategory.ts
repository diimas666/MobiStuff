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
// ➡️ Ты обязан использовать только те значения, которые есть в catalogCategory, иначе будет 404. ГЛАВНЫЕ ДАННЫЕ
export const catalogCategory = [
  {
    title: 'Автомобільна тематика',
    icon: Car,
    seoTitle: 'Купити автомобільна тематика, Відео реєстратори | MobiStuff',
    seoDescription:
      'Широкий вибір: Тримачі,  Автомобільні зарядні пристрої,  Відео реєстратори, Аксесуари для авто, FM-модулятори – у категорії «Автомобільна тематика». Швидка доставка по Україні.',
    subcategories: [
      'Тримачі',
      'Відео реєстратори',
      'Автомобільні зарядні пристрої',
      'Аксесуари для авто',
      'FM-модулятори',
    ],
  },

  {
    title: 'Акумулятори та PowerBank',
    icon: BatteryCharging,
    seoTitle: 'Купити акумулятори та PowerBank | MobiStuff',
    seoDescription:
      'Великий вибір павербанків, сонячних батарей і мережевих зарядок. Швидка доставка!',
    subcategories: [
      'Павербанки',
      'Зарядні станції',
      'Мережеві зарядки',
      'UPS Джерело Бесперебійного Живлення',
    ],
  },
  {
    title: 'Аудіо та відео',
    icon: Volume2,
    seoTitle: 'Купити аудіо та відео аксесуари | MobiStuff',
    seoDescription:
      "Колонки, підсилювачі, Геймпади, Комп'ютерна акустика, Bluetooth-адаптери — широкий вибір для якісного звуку.",
    subcategories: [
      'Колонки',
      'Підсилювачі',
      'TV приставки',
      'Геймпади',
      "Комп'ютерна акустика",
    ],
  },
  {
    title: 'Гаджети',
    icon: Watch,
    seoTitle: 'Купити гаджети | MobiStuff',
    seoDescription:
      'Смарт-годинники, трекери, камери — актуальні гаджети для вас.',
    subcategories: [
      'Розумні годинники і фітнес трекери',
      'Аксесуари для розумних годинникiв і фітнес трекерів',
      'Моноподи',
      'Настільні led лампи',
      'Мікрофони',
      'Кiльцевi лампи',
      'Iншi гаджети',
    ],
  },
  {
    title: 'Зарядки та кабелі',
    icon: Plug,
    seoTitle: 'Купити зарядки та кабелі | MobiStuff',
    seoDescription:
      'USB, Lightning, MicroUSB — якісні кабелі та зарядки для будь-яких пристроїв.',
    subcategories: [
      'Lightning',
      'MicroUSB',
      'Type-c',
      'Бездротові зарядні пристрої',
      'Мережеві зарядні пристрої',
      'Хаби, перехідники, подовжувачі',
    ],
  },
  {
    title: "Комп'ютерна периферія",
    icon: MonitorSmartphone,
    seoTitle: 'Купити комп’ютерну периферію | MobiStuff',
    seoDescription:
      "Мишки, клавіатури, пiдставки для ноутбукiв, ігрові поверхні, карти пам'яті, usb накопичувачі, Веб камери — зручні пристрої для роботи та розваг.",
    subcategories: [
      'Мишки',
      'Клавіатури',
      'Пiдставки для ноутбукiв',
      'Ігрові поверхні',
      "Карти пам'яті",
      'Usb накопичувачі',
      'Веб камери',
    ],
  },
  {
    title: 'Навушники',
    icon: Headphones,
    seoTitle: 'Купити навушники | MobiStuff',
    seoDescription:
      'Великий вибір навушників – дротові, Bluetooth, TWS. Доставка по Україні.',
    subcategories: ['Усі навушники', 'TWS', 'Провідні', 'З мікрофоном'], // 👈 добавлена "Усі навушники"
  },

  {
    title: 'Корисні аксесуари',
    icon: Puzzle,
    seoTitle: 'Купити корисні аксесуари | MobiStuff',
    seoDescription:
      'Органайзери, кабель-тестери, підставки — все для зручності та порядку.',
    subcategories: ['Кабель-тестери', 'Органайзери', 'Підставки'],
  },
  {
    title: 'Захист екрану',
    icon: Shield,
    seoTitle: 'Купити захист екрану | MobiStuff',
    seoDescription:
      'Плівки, захисне скло, антишпигун — збережіть ваш екран як новий.',
    subcategories: ['Плівки', 'Захисне скло', 'Антишпигун'],
  },
  {
    title: 'Чохли',
    icon: Smartphone,
    seoTitle:
      'Купити чохли для телефонів, AirPods, планшетів та ноутбуків | MobiStuff',
    seoDescription:
      'Замовляйте стильні та надійні чохли для смартфонів, навушників, планшетів та ноутбуків. Великий вибір — захист і дизайн в одному.',
    subcategories: [
      'Для телефонів',
      'Для AirPods',
      'Для планшетів і ноутбуків',
    ],
  },
].map((item) => {
  const slug = toSlug(item.title);
  const subcategories = item.subcategories.map((title) => {
    const subSlug = toSlug(title);
    return {
      title,
      slug: subSlug,
      seoTitle: `${title} – ${item.title} | MobiStuff`,
      seoDescription: `Купити «${title}» у категорії «${item.title}». Великий вибір, знижки та новинки на MobiStuff.`,
    };
  });

  return {
    ...item,
    slug,
    subcategories,
  };
});
