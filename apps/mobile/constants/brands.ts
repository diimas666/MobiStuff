import type { BrandItem } from '../types/brand';

type BrandDefinition = Omit<BrandItem, 'image' | 'imageFull'> & {
  imagePath: string;
  imageFullPath: string;
};

export const BRAND_DEFINITIONS: BrandDefinition[] = [
  {
    id: 1,
    title: 'Ridea',
    handle: 'ridea',
    imagePath: '/images/brands/ridea.webp',
    imageFullPath: '/images/brands/imagesFull/ridea.webp',
    description: [
      'В розробці своєї продукції компанія Ridea зробила головний фокус на якості збірки та інновативності технологій по доступній ціні, адже це виявляється найголовнішим у результаті для кінцевого споживача.',
      'Завдяки чесній ціні та відмінній якості Ridea з легкістю конкурує з популярними брендами.',
      'Мобільні аксесуари Ridea відрізняються відмінним технічним наповненням. Це той випадок, коли результат перевищує очікування найвибагливіших споживачів.',
    ],
    products: [],
  },
  {
    id: 2,
    title: 'XO',
    handle: 'xo',
    imagePath: '/images/brands/xo.webp',
    imageFullPath: '/images/brands/imagesFull/XO.webp',
    description: [
      "Це відносно молодий китайський бренд, який швидко завоював світ завдяки своєму унікальному екстер'єру та високій якості продукції.",
      'XO brand пропонує фантастичний вибір корисних аксесуарів для власників найрізноманітніших гаджетів. Вся продукція створюється на сучасному автоматизованому обладнанні та відповідає європейським стандартам.',
      'Найуспішнішими позиціями каталогу є:',
    ],
    products: [
      'Повнорозмірні ігрові навушники: дротова гарнітура з якісного пластику, амбушури – з екошкіри, з мікрофоном та підсвічуванням, потужність ~30mW.',
      'Автомобільні тримачі телефонів: забезпечують надійну фіксацію смартфона, регулювання кута, ідеальні для GPS.',
      'Портативні Bluetooth колонки: потужність ~10W, підтримка Bluetooth, USB, Micro-SD, AUX, Jack 6.35 мм.',
      'Дротові миші: підсвічуються, виготовлені з пластику і силікону, інтерфейс USB.',
    ],
  },
  {
    id: 3,
    title: 'Baseus',
    handle: 'baseus',
    imagePath: '/images/brands/baseus.webp',
    imageFullPath: '/images/brands/imagesFull/baseus.webp',
    description: [
      'Baseus був заснований в 2011 році, як бренд побутової і мобільної електроніки, компанією Shenzhen Times Innovation Technology Co. Ltd., яка займається розробкою дизайну, дослідженнями, виробництвом і продажем продукції Baseus.',
      'Стійке зростання і розвиток компанії протягом 10 років дозволили Baseus стати провідним підприємством в галузі побутової і мобільної електроніки в Китаї.',
    ],
    products: [],
  },
  {
    id: 4,
    title: 'Borofone',
    handle: 'borofone',
    imagePath: '/images/brands/borofone.webp',
    imageFullPath: '/images/brands/imagesFull/borofone.webp',
    description: [
      'Borofone — це бренд аксесуарів для мобільних пристроїв, який є дочірнім підприємством компанії HOCO Technology (Hong Kong) Co., Ltd. Бренд був заснований у 2011 році і спеціалізується на виробництві високоякісних аксесуарів для цифрових пристроїв.',
    ],
    products: [],
  },
  {
    id: 5,
    title: 'Celebrat',
    handle: 'celebrat',
    imagePath: '/images/brands/Celebrat.webp',
    imageFullPath: '/images/brands/imagesFull/Celebrat.webp',
    description: [
      'Молодий китайський бренд "Celebrat" зосередився на якості продукції. Поки ще не культовий, але вже досить відомий бренд мобільних аксесуарів.',
      '"Успіх приходить до тих, хто уважний до дрібниць" - головною продукцією торгової марки є:',
    ],
    products: ['гарнітури для мобільних телефонів', 'кабелі синхронізації'],
  },
  {
    id: 6,
    title: 'Fantech',
    handle: 'fantech',
    imagePath: '/images/brands/fantech.webp',
    imageFullPath: '/images/brands/imagesFull/fantech.webp',
    description: [
      "Це компанія, відома як виробник ігрової периферії та комп'ютерних аксесуарів. Вона була заснована в 2009 році і швидко розширила свою присутність на ринку.",
      'Fantech звертає увагу на дизайн, технічні характеристики та доступну ціну, що робить її продукцію популярною.',
    ],
    products: [],
  },
  {
    id: 7,
    title: 'Hoco',
    handle: 'hoco',
    imagePath: '/images/brands/hoco.webp',
    imageFullPath: '/images/brands/imagesFull/hoco.webp',
    description: [
      'Компанія надає широкий асортимент цифрових аксесуарів і товарів для щоденного життя. Основний акцент компанії hoco зроблено на якість продукції.',
    ],
    products: [],
  },
  {
    id: 8,
    title: 'Inobi',
    handle: 'inobi',
    imagePath: '/images/brands/inobi.jpg',
    imageFullPath: '/images/brands/imagesFull/inobi.webp',
    description: [
      'iNobi - українська компанія, яка з 2022 року спеціалізується на розробці та виробництві захисних плівок та стекол для екранів смартфонів, планшетів та ноутбуків.',
    ],
    products: [],
  },
];

function toAbsoluteUrl(origin: string, path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function resolveBrandItems(origin: string): BrandItem[] {
  return BRAND_DEFINITIONS.map(brand => ({
    id: brand.id,
    title: brand.title,
    handle: brand.handle,
    image: toAbsoluteUrl(origin, brand.imagePath),
    imageFull: toAbsoluteUrl(origin, brand.imageFullPath),
    description: brand.description,
    products: brand.products,
  }));
}
