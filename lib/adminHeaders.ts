export function adminHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('admin_access') : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
