import type { ApiProduct } from '../../types/catalog';

export const batteryCategorySlug = 'category-akkumulyatori-i-powerbank';

export const batteryProducts: ApiProduct[] = [
  {
    _id: '1',
    title: 'Phone battery',
    handle: 'phone-battery',
    price: 500,
    subcategorySlug: 'category-akkumulyatori-dlya-telefonov',
    subcategory: 'Акумулятори для телефонів',
  },
  {
    _id: '2',
    title: 'Laptop battery',
    handle: 'laptop-battery',
    price: 1200,
    subcategorySlug: 'category-akkumulyator-dlya-noutbuka',
  },
  {
    _id: '3',
    title: 'Power bank',
    handle: 'power-bank',
    price: 800,
    subcategorySlug: 'category-portativnie-batarei',
    subcategory: 'Портативні батареї',
  },
];
