import { revalidatePath, revalidateTag } from 'next/cache';

/** Скидає кеш вітрини після змін в адмінці, щоб зміни було видно одразу */
export function revalidateStore() {
  try {
    revalidateTag('products');
    revalidatePath('/', 'layout');
  } catch (e) {
    console.error('revalidate failed', e);
  }
}
