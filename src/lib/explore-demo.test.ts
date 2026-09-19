import { describe, expect, it } from 'vitest';
import { demoTotals, freshDemo, loadDemo } from './explore-demo';

describe('isolated wedding demo', () => {
  it('starts with consistent sample totals', () => {
    expect(demoTotals(freshDemo())).toEqual({ spent: 51200, remaining: 33800, confirmed: 7, waiting: 2, declined: 1, readiness: 75 });
  });
  it('counts people, not only invitations', () => {
    const state = freshDemo();
    state.guests.push({ id: 'visitor', name: 'Sample visitor', status: 'Confirmed', party: 3, town: 'Windhoek', meal: 'Vegetarian' });
    expect(demoTotals(state).confirmed).toBe(10);
  });
  it('preserves overspending instead of hiding it', () => {
    const state = freshDemo();
    state.budget = 50000;
    expect(demoTotals(state).remaining).toBe(-1200);
  });
  it('round trips session state and resets corrupt or external photo data', () => {
    const state = freshDemo();
    expect(loadDemo(JSON.stringify(state))).toEqual(state);
    expect(loadDemo('{bad')).toEqual(freshDemo());
    state.photos[0].src = 'https://example.com/private-client.jpg';
    expect(loadDemo(JSON.stringify(state))).toEqual(freshDemo());
  });
});
