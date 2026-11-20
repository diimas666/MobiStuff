import 'server-only';
import { createHmac } from 'crypto';

/**
 * Telegram-бот магазину: сповіщення менеджеру, кнопки статусів замовлення,
 * резервні копії бази файлом. Потрібні TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID.
 */
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
const chatId = () => process.env.TELEGRAM_CHAT_ID || '';
export const telegramConfigured = () => Boolean(token() && chatId());

type Button = { text: string; callback_data: string };

async function call(method: string, body: Record<string, unknown> | FormData) {
  if (!token()) return null;
  const isForm = body instanceof FormData;
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(isForm ? 30000 : 8000),
  }).catch(() => null);
  return r ? r.json().catch(() => null) : null;
}

export async function notifyTelegram(text: string, buttons?: Button[][]) {
  if (!telegramConfigured()) return;
  await call('sendMessage', { chat_id: chatId(), text: text.slice(0, 4000), ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}) });
}

export async function sendTelegramFile(filename: string, content: Uint8Array, caption: string) {
  if (!telegramConfigured()) return false;
  const form = new FormData();
  form.append('chat_id', chatId());
  form.append('caption', caption.slice(0, 1000));
  form.append('document', new Blob([content as BlobPart]), filename);
  const r = await call('sendDocument', form);
  return Boolean(r?.ok);
}

export async function answerCallback(id: string, text: string) {
  await call('answerCallbackQuery', { callback_query_id: id, text });
}

export async function editMessageButtons(chat: string | number, messageId: number, buttons: Button[][]) {
  await call('editMessageReplyMarkup', { chat_id: chat, message_id: messageId, reply_markup: { inline_keyboard: buttons } });
}

/** Секрет вебхука (Telegram надсилає його в заголовку) — похідний від токена бота */
export const webhookSecret = () => createHmac('sha256', 'mobistuff-tg').update(token()).digest('hex').slice(0, 48);

export async function setWebhook(url: string) {
  return call('setWebhook', { url, secret_token: webhookSecret(), allowed_updates: ['callback_query'] });
}

export const isManagerChat = (id: unknown) => String(id) === String(chatId());

/** Кнопки зміни статусу під повідомленням про замовлення */
export function orderButtons(orderId: string, status = 'processing'): Button[][] {
  const row: Button[] = [];
  if (status === 'processing') row.push({ text: '✅ Прийняти', callback_data: `st:${orderId}:in_progress` });
  if (status === 'processing' || status === 'in_progress') row.push({ text: '📦 Відправлено', callback_data: `st:${orderId}:shipped` });
  if (status === 'shipped') row.push({ text: '🏁 Виконано', callback_data: `st:${orderId}:completed` });
  if (status !== 'cancelled' && status !== 'completed' && status !== 'returned') row.push({ text: '✖ Скасувати', callback_data: `st:${orderId}:cancelled` });
  return row.length ? [row] : [];
}
