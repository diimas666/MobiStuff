import { api } from '../config/api';
import type { SupportTopicId } from '../constants/support';

export type SupportRequestPayload = {
  topic: SupportTopicId;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
};

export async function submitSupportRequest(payload: SupportRequestPayload) {
  const response = await api.support(payload);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? 'Не вдалося надіслати повідомлення');
  }

  return response.json() as Promise<{ success: boolean }>;
}
