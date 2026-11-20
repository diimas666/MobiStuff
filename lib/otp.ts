import 'server-only';
import dbConnect from '@/lib/dbConnect';
import OtpCode from '@/app/api/models/OtpCode';
import { otpMatches } from '@/lib/orderAccess';

const MAX_ATTEMPTS = 5;

/** Перевірка коду з SMS: { ok } або { error } для покупця. Код одноразовий. */
export async function verifyOtp(phone: string, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await dbConnect();
  const otp = await OtpCode.findOne({ phone, expiresAt: { $gt: new Date() } });
  if (!otp) return { ok: false, error: 'Код недійсний або застарів. Запросіть новий.' };
  if (!otpMatches(phone, code, otp.codeHash)) {
    otp.attempts += 1;
    if (otp.attempts >= MAX_ATTEMPTS) await otp.deleteOne();
    else await otp.save();
    const left = MAX_ATTEMPTS - otp.attempts;
    return { ok: false, error: left > 0 ? `Невірний код. Залишилось спроб: ${left}` : 'Забагато невірних спроб. Запросіть новий код.' };
  }
  await otp.deleteOne();
  return { ok: true };
}
