/** Нормалізує український номер до формату +380XXXXXXXXX */
export function normalizeUkrainianPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');

  if (!digits) return null;

  if (digits.length === 12 && digits.startsWith('380')) {
    // 380993066833
  } else if (digits.length === 12 && digits.startsWith('80')) {
    // 809930668333 → 380993066833
    digits = `3${digits}`;
  } else if (digits.length === 11 && digits.startsWith('80')) {
    // 80993066833 → 380993066833
    digits = `3${digits}`;
  } else if (digits.length === 10 && digits.startsWith('0')) {
    // 0993066833 → 380993066833
    digits = `38${digits}`;
  } else if (digits.length === 9) {
    // 993066833 → 380993066833
    digits = `380${digits}`;
  } else {
    return null;
  }

  return /^380\d{9}$/.test(digits) ? `+${digits}` : null;
}

export function isValidUkrainianPhone(phone: string) {
  return normalizeUkrainianPhone(phone) !== null;
}
