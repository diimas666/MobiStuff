/**
 * Дані з бази для сторінок вітрини: якщо база тимчасово недоступна
 * (напр. під час збірки на Vercel), сторінка все одно збереться з порожнім
 * блоком, а при наступному оновленні (ISR) підтягне товари.
 */
export function safe<T>(promise: Promise<T>, fallback: T, label = 'data'): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error(`[safe] ${label}: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  });
}
