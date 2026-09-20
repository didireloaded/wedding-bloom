export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validGuestContent(value: Record<string, unknown>) {
  return typeof value.wedding_id === 'string' && uuidPattern.test(value.wedding_id)
    && typeof value.guest_session === 'string' && value.guest_session.length >= 16 && value.guest_session.length <= 512
    && (value.kind === 'guestbook' || value.kind === 'moment')
    && typeof value.guest_name === 'string' && value.guest_name.trim().length > 0 && value.guest_name.length <= 100
    && typeof value.message === 'string' && value.message.length <= 1000
    && (value.storage_path == null || typeof value.storage_path === 'string')
    && (value.message.trim().length > 0 || (value.kind === 'moment' && !!value.storage_path));
}

export function ownsGuestPhoto(path: string, weddingId: string, sessionId: string) {
  const parts = path.split('/');
  return parts.length === 4 && parts[0] === weddingId && parts[1] === 'photos'
    && parts[2] === sessionId && parts[3].endsWith('.jpg') && uuidPattern.test(parts[3].slice(0, -4));
}
