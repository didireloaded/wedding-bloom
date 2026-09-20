const allowedHosts = [
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com',
];

const base64Url = /^[A-Za-z0-9_-]+$/;

export function validPushEndpoint(value: unknown): boolean {
  if (typeof value !== 'string' || value.length < 20 || value.length > 2_048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const host = url.hostname.toLowerCase();
    return allowedHosts.includes(host) || host.endsWith('.notify.windows.com');
  } catch {
    return false;
  }
}

export function validPushKeys(keys: unknown): boolean {
  if (!keys || typeof keys !== 'object') return false;
  const { p256dh, auth } = keys as Record<string, unknown>;
  return typeof p256dh === 'string' && p256dh.length >= 80 && p256dh.length <= 120 && base64Url.test(p256dh)
    && typeof auth === 'string' && auth.length >= 16 && auth.length <= 40 && base64Url.test(auth);
}
