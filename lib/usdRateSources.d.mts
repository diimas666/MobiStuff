export function fetchMmaUsdRate(): Promise<number | null>;
export function fetchNbuUsdRate(): Promise<number | null>;
export function resolveUsdRate(): Promise<{ rate: number; source: string }>;
