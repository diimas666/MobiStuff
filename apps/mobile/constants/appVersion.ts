/** Версія застосунку (синхронно з MARKETING_VERSION у Xcode) */
export const APP_VERSION = '1.1';
export const APP_STORE_URL = 'https://apps.apple.com/app/id6785212528';

/** -1 / 0 / 1 */
export function compareVersions(a: string, b: string) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
