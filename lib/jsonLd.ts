/** Безпечна серіалізація JSON-LD: `<` екранується, тож `</script>` у даних не розірве тег */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
