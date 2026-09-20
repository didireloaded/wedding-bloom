import { describe, expect, it } from 'vitest';
import { ownsGuestPhoto, validGuestContent } from '../../supabase/functions/_shared/guest-content-validation';

const wedding = '11111111-1111-4111-8111-111111111111';
const session = '22222222-2222-4222-8222-222222222222';
const photo = '33333333-3333-4333-8333-333333333333';
const valid = { wedding_id: wedding, guest_session: 'a'.repeat(64), kind: 'guestbook', guest_name: 'Demo guest', message: 'Congratulations!' };

describe('guest content boundary', () => {
  it('accepts valid content and rejects missing identity', () => {
    expect(validGuestContent(valid)).toBe(true);
    expect(validGuestContent({ ...valid, guest_session: '' })).toBe(false);
    expect(validGuestContent({ ...valid, wedding_id: 'invalid' })).toBe(false);
  });
  it('bounds names and messages', () => {
    expect(validGuestContent({ ...valid, guest_name: ' ' })).toBe(false);
    expect(validGuestContent({ ...valid, message: 'a'.repeat(1001) })).toBe(false);
    expect(validGuestContent({ ...valid, kind: 'other' })).toBe(false);
  });
  it('allows a photo-only moment, but requires a guestbook message', () => {
    expect(validGuestContent({ ...valid, kind: 'moment', message: '', storage_path: 'photo' })).toBe(true);
    expect(validGuestContent({ ...valid, message: '', storage_path: 'photo' })).toBe(false);
  });
  it('binds photos to the wedding and guest session', () => {
    const path = `${wedding}/photos/${session}/${photo}.jpg`;
    expect(ownsGuestPhoto(path, wedding, session)).toBe(true);
    expect(ownsGuestPhoto(path, wedding, photo)).toBe(false);
    expect(ownsGuestPhoto(path, photo, session)).toBe(false);
    expect(ownsGuestPhoto(path.replace('.jpg', '.svg'), wedding, session)).toBe(false);
    expect(ownsGuestPhoto(`${path}/../other.jpg`, wedding, session)).toBe(false);
  });
});
