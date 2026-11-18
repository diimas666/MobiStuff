/**
 * Легка серверна очистка HTML-описів (від постачальника / адмінки):
 * прибирає скрипти, iframe, обробники подій і javascript:-посилання.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta|base|svg|math)\b[\s\S]*?(<\s*\/\s*\1\s*>|\/?>)/gi, '')
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|link|meta|base|svg|math)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data):[^"'\s>]*\2?/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*expression[^"]*"|'[^']*expression[^']*')/gi, '');
}
