export interface Brand {
  id: number;
  title: string;
  image: string;
  handle: string;
  description?: string;
  imageFull: string;
}
export const brands: Brand[] = [
  {
    id: 1,
    title: 'Ridea',
    image: '/images/brands/ridea.png',
    imageFull: '/images/brands/imagesFull/ridea.jpg',
    handle: 'ridea',
    description: '',
  },
  {
    id: 2,
    title: 'XO',
    image: '/images/brands/xo.jpg',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'xo',
    description: '',
  },
  {
    id: 3,
    title: 'Baseus',
    image: '/images/brands/baseus.png',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'baseus',
    description: '',
  },
  {
    id: 3,
    title: 'Borofone',
    image: '/images/brands/borofone.jpg',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'borofone',
    description: '',
  },
  {
    id: 5,
    title: 'Celebrat',
    image: '/images/brands/Celebrat.png',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'celebrat',
    description: '',
  },
  {
    id: 6,
    title: 'Fantech',
    image: '/images/brands/fantech.png',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'fantech',
    description: '',
  },
  {
    id: 7,
    title: 'Hoco',
    image: '/images/brands/hoco.png',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'hoco',
    description: '',
  },
  {
    id: 8,
    title: 'Inobi',
    image: '/images/brands/inobi.png',
    imageFull: '/images/brands/imagesFull/xo.jpg',
    handle: 'inobi',
    description: '',
  },
];
