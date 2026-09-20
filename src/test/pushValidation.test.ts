import { describe, expect, it } from 'vitest';
import { validPushEndpoint, validPushKeys } from '../../supabase/functions/_shared/push-validation';

describe('push subscription boundary', () => {
  it('accepts known browser push services only', () => {
    expect(validPushEndpoint('https://fcm.googleapis.com/fcm/send/abc')).toBe(true);
    expect(validPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/abc')).toBe(true);
    expect(validPushEndpoint('https://web.push.apple.com/QxY')).toBe(true);
    expect(validPushEndpoint('https://db5.notify.windows.com/w/?token=abc')).toBe(true);
    expect(validPushEndpoint('https://example.com/push')).toBe(false);
    expect(validPushEndpoint('http://fcm.googleapis.com/push')).toBe(false);
    expect(validPushEndpoint('https://fcm.googleapis.com.evil.example/push')).toBe(false);
  });
  it('requires bounded URL-safe encryption keys', () => {
    expect(validPushKeys({ p256dh: 'A'.repeat(87), auth: 'b'.repeat(22) })).toBe(true);
    expect(validPushKeys({ p256dh: '', auth: '' })).toBe(false);
    expect(validPushKeys({ p256dh: 'A'.repeat(87), auth: 'not valid key!' })).toBe(false);
  });
});
