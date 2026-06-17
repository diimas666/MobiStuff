export const SUPPORT_STORE_EMAIL = 'mobistuffinfo@gmail.com';
export const SUPPORT_TEAM_EMAIL = 'uu36548@gmail.com';

export const SUPPORT_TOPIC_LABELS = {
  product: 'Питання про товар',
  order: 'Замовлення та доставка',
  return: 'Повернення товару',
  suggestion: 'Пропозиція або ідея',
  app: 'Проблема з додатком',
  other: 'Інше',
} as const;

export type SupportTopicId = keyof typeof SUPPORT_TOPIC_LABELS;

export const SUPPORT_TOPICS = Object.entries(SUPPORT_TOPIC_LABELS).map(
  ([id, label]) => ({ id: id as SupportTopicId, label }),
);
