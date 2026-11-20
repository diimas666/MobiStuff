import 'server-only';
import http2 from 'node:http2';
import { createPrivateKey, sign } from 'node:crypto';
import dbConnect from '@/lib/dbConnect';
import PushDevice from '@/app/api/models/PushDevice';

/**
 * Відправка push через Apple Push Notification service (HTTP/2 + JWT ES256).
 * Потрібні змінні: APNS_KEY (вміст .p8), APNS_KEY_ID, APNS_TEAM_ID,
 * APNS_BUNDLE_ID (shop.mobistuff.app), APNS_PRODUCTION=true для App Store.
 */
export const apnsConfigured = () => Boolean(process.env.APNS_KEY && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID);

let jwtCache: { token: string; at: number } | null = null;

function providerToken() {
  if (jwtCache && Date.now() - jwtCache.at < 40 * 60 * 1000) return jwtCache.token;
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const header = b64({ alg: 'ES256', kid: process.env.APNS_KEY_ID });
  const claims = b64({ iss: process.env.APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) });
  const key = createPrivateKey((process.env.APNS_KEY || '').replace(/\\n/g, '\n'));
  const sig = sign('sha256', Buffer.from(`${header}.${claims}`), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  jwtCache = { token: `${header}.${claims}.${sig}`, at: Date.now() };
  return jwtCache.token;
}

export type PushMessage = { title: string; body: string; url?: string };

/** Надсилає повідомлення на токени; недійсні токени видаляє. Повертає кількість доставлених. */
export async function sendPush(tokens: string[], msg: PushMessage): Promise<number> {
  if (!apnsConfigured() || tokens.length === 0) return 0;
  const host = process.env.APNS_PRODUCTION === 'true' ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
  const client = http2.connect(host);
  const payload = JSON.stringify({
    aps: { alert: { title: msg.title.slice(0, 100), body: msg.body.slice(0, 300) }, sound: 'default' },
    ...(msg.url ? { url: msg.url } : {}),
  });
  const bad: string[] = [];
  let delivered = 0;
  const auth = providerToken();

  await Promise.all(
    [...new Set(tokens)].map(
      (token) =>
        new Promise<void>((resolve) => {
          const req = client.request({
            ':method': 'POST',
            ':path': `/3/device/${token}`,
            authorization: `bearer ${auth}`,
            'apns-topic': process.env.APNS_BUNDLE_ID || 'shop.mobistuff.app',
            'apns-push-type': 'alert',
            'content-type': 'application/json',
          });
          let status = 0;
          let body = '';
          req.on('response', (h) => (status = Number(h[':status'])));
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            if (status === 200) delivered++;
            else if (status === 410 || /BadDeviceToken|Unregistered/.test(body)) bad.push(token);
            resolve();
          });
          req.on('error', () => resolve());
          req.setTimeout(10000, () => {
            req.close();
            resolve();
          });
          req.end(payload);
        })
    )
  );
  client.close();
  if (bad.length) {
    await dbConnect();
    await PushDevice.deleteMany({ token: { $in: bad } });
  }
  return delivered;
}

/** Push власнику замовлення (за номером телефону) */
export async function pushToPhone(phone: string, msg: PushMessage) {
  if (!apnsConfigured() || !phone) return 0;
  await dbConnect();
  const devices = await PushDevice.find({ phones: phone }).select('token').lean<{ token: string }[]>();
  return sendPush(devices.map((d) => d.token), msg);
}

/** Push власнику конкретного замовлення: пристрої, що оформили його, або з підтвердженим номером */
export async function pushForOrder(orderId: string, phone: string, msg: PushMessage) {
  if (!apnsConfigured()) return 0;
  await dbConnect();
  const devices = await PushDevice.find({ $or: [{ orderIds: orderId }, { phones: phone }] }).select('token').lean<{ token: string }[]>();
  return sendPush(devices.map((d) => d.token), msg);
}
