/** Заголовки для запитів адмінки. Авторизація — через httpOnly-cookie сесії. */
export function adminHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}
