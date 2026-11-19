/** 1 товар, 2 товари, 5 товарів */
export function pluralGoods(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} товар`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} товари`;
  return `${n} товарів`;
}
