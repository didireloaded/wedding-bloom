export const PUBLIC_AI_ACTIONS = new Set(['interpret_rsvp_message', 'parse_rsvp', 'parse_natural_rsvp', 'chat_assistant']);

export function validateAiPayload(type: unknown, params: Record<string, unknown>) {
  if (typeof type !== 'string' || type.length < 1 || type.length > 80) return 'Invalid assistant action';
  const serialized = JSON.stringify(params);
  if (serialized.length > 60_000) return 'Assistant request is too large';
  if ('question' in params && (typeof params.question !== 'string' || params.question.trim().length < 1 || params.question.length > 2_000)) return 'Question must be between 1 and 2,000 characters';
  if ('message' in params && typeof params.message === 'string' && params.message.length > 2_000) return 'Message is too long';
  if ('history' in params) {
    if (!Array.isArray(params.history) || params.history.length > 12) return 'Conversation history is too long';
    if (params.history.some(item => !item || typeof item !== 'object'
      || !['user', 'assistant'].includes(String((item as Record<string, unknown>).role))
      || typeof (item as Record<string, unknown>).content !== 'string'
      || String((item as Record<string, unknown>).content).length > 2_000)) return 'Conversation history is invalid';
  }
  return null;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
