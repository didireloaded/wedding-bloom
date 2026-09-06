import { describe, expect, it } from 'vitest';
import { calculateBudgetUsage, summarizeBudget, type BudgetEntry } from './BudgetTracker';

const entry = (category: string, amount: number): BudgetEntry => ({ id: `${category}-${amount}`, title: category, category, amount, spent_on: '2026-09-07', notes: '', receipt_url: null });

describe('budget summary', () => {
  it('groups and sorts spending by category', () => {
    const result = summarizeBudget([entry('Venue', 600), entry('Catering', 300), entry('Venue', 100)]);
    expect(result.map(item => item.category)).toEqual(['Venue', 'Catering']);
    expect(result[0]).toMatchObject({ amount: 700, percent: 70 });
    expect(result[1]).toMatchObject({ amount: 300, percent: 30 });
  });

  it('does not return empty categories', () => {
    expect(summarizeBudget([])).toEqual([]);
  });
});

describe('budget usage state', () => {
  it('reports the exact amount and percentage over budget', () => {
    expect(calculateBudgetUsage(50000, 62500)).toEqual({ percent: 125, progress: 100, overBy: 12500, isOver: true });
  });

  it('keeps an available budget in its normal state', () => {
    expect(calculateBudgetUsage(50000, 20000)).toEqual({ percent: 40, progress: 40, overBy: 0, isOver: false });
  });
});
