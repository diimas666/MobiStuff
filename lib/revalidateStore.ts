import { revalidatePath, revalidateTag } from 'next/cache';

/** Скидає кеш вітрини після змін в адмінці, щоб зміни було видно одразу */
export function revalidateStore() {
  try {
    revalidateTag('products', { expire: 0 }); // Next 16: одразу прострочити, без stale-while-revalidate
    revalidatePath('/', 'layout');
  } catch (e) {
    console.error('revalidate failed', e);
  }
}
