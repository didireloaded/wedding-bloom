import { describe, expect, it } from 'vitest';
import { PUBLIC_AI_ACTIONS, validateAiPayload } from '../../supabase/functions/_shared/ai-security';

describe('AI request boundary', () => {
  it('keeps only guest chat and RSVP interpretation public', () => {
    expect(PUBLIC_AI_ACTIONS.has('chat_assistant')).toBe(true);
    expect(PUBLIC_AI_ACTIONS.has('parse_natural_rsvp')).toBe(true);
    for (const action of ['daily_report', 'generate_theme', 'generate_insights', 'suggest_seating', 'suggest_highlights']) {
      expect(PUBLIC_AI_ACTIONS.has(action)).toBe(false);
    }
  });
  it('bounds questions, history and total payload size', () => {
    expect(validateAiPayload('chat_assistant', { question: 'When is the ceremony?', history: [] })).toBeNull();
    expect(validateAiPayload('chat_assistant', { question: '', history: [] })).toMatch(/Question/);
    expect(validateAiPayload('chat_assistant', { question: 'x'.repeat(2001), history: [] })).toMatch(/Question/);
    expect(validateAiPayload('chat_assistant', { question: 'Hello', history: Array(13).fill({ role: 'user', content: 'x' }) })).toMatch(/history/);
    expect(validateAiPayload('generate_story', { blob: 'x'.repeat(60_001) })).toMatch(/large/);
  });
});
