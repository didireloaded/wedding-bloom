import { describe, it, expect } from "vitest";

/**
 * Unit tests for the budget calculation logic extracted from planningSuite.
 * These test the pure calculation functions without rendering React components.
 */

interface BudgetItem {
  id: string;
  wedding_id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  deposit_paid: number;
  due_date: string | null;
  status: "paid" | "pending" | "overdue";
}

// ── Extracted calculation functions (same logic as in planningSuite.tsx) ──
function calcTotalEstimated(budgets: BudgetItem[]): number {
  return budgets.reduce((acc, b) => acc + Number(b.estimated_cost || 0), 0);
}

function calcTotalActual(budgets: BudgetItem[]): number {
  return budgets.reduce((acc, b) => acc + Number(b.actual_cost || 0), 0);
}

function calcRemainingFunds(budgets: BudgetItem[]): number {
  return calcTotalEstimated(budgets) - calcTotalActual(budgets);
}

function calcPercentUsed(budgets: BudgetItem[]): number {
  const totalEst = calcTotalEstimated(budgets);
  const totalAct = calcTotalActual(budgets);
  return totalEst > 0 ? Math.min(Math.round((totalAct / totalEst) * 100), 100) : 0;
}

function getProgressColorClass(percentUsed: number): string {
  return percentUsed < 75 ? "bg-emerald-500" : percentUsed <= 90 ? "bg-amber-400" : "bg-rose-500";
}

function groupByCategory(budgets: BudgetItem[]): string[] {
  return Array.from(new Set(budgets.map(b => b.category)));
}

// ── Test data ──
const makeBudget = (overrides: Partial<BudgetItem> = {}): BudgetItem => ({
  id: crypto.randomUUID(),
  wedding_id: "w1",
  category: "Venue & Catering",
  item_name: "Test Item",
  estimated_cost: 1000,
  actual_cost: 800,
  deposit_paid: 200,
  due_date: "2026-08-30",
  status: "pending",
  ...overrides,
});

describe("Budget Calculations", () => {
  describe("calcTotalEstimated", () => {
    it("returns 0 for empty budgets", () => {
      expect(calcTotalEstimated([])).toBe(0);
    });

    it("sums estimated costs correctly", () => {
      const budgets = [
        makeBudget({ estimated_cost: 5000 }),
        makeBudget({ estimated_cost: 3000 }),
        makeBudget({ estimated_cost: 1500 }),
      ];
      expect(calcTotalEstimated(budgets)).toBe(9500);
    });

    it("handles zero costs", () => {
      const budgets = [
        makeBudget({ estimated_cost: 0 }),
        makeBudget({ estimated_cost: 1000 }),
      ];
      expect(calcTotalEstimated(budgets)).toBe(1000);
    });
  });

  describe("calcTotalActual", () => {
    it("sums actual costs correctly", () => {
      const budgets = [
        makeBudget({ actual_cost: 4800 }),
        makeBudget({ actual_cost: 2900 }),
      ];
      expect(calcTotalActual(budgets)).toBe(7700);
    });
  });

  describe("calcRemainingFunds", () => {
    it("calculates positive remaining when under budget", () => {
      const budgets = [
        makeBudget({ estimated_cost: 10000, actual_cost: 7500 }),
      ];
      expect(calcRemainingFunds(budgets)).toBe(2500);
    });

    it("returns negative when over budget", () => {
      const budgets = [
        makeBudget({ estimated_cost: 5000, actual_cost: 6000 }),
      ];
      expect(calcRemainingFunds(budgets)).toBe(-1000);
    });

    it("returns 0 when exactly on budget", () => {
      const budgets = [
        makeBudget({ estimated_cost: 3000, actual_cost: 3000 }),
      ];
      expect(calcRemainingFunds(budgets)).toBe(0);
    });
  });

  describe("calcPercentUsed", () => {
    it("returns 0 for empty budgets", () => {
      expect(calcPercentUsed([])).toBe(0);
    });

    it("returns 0 when total estimated is 0", () => {
      const budgets = [makeBudget({ estimated_cost: 0, actual_cost: 0 })];
      expect(calcPercentUsed(budgets)).toBe(0);
    });

    it("calculates percentage correctly", () => {
      const budgets = [
        makeBudget({ estimated_cost: 10000, actual_cost: 7500 }),
      ];
      expect(calcPercentUsed(budgets)).toBe(75);
    });

    it("caps at 100% even when over budget", () => {
      const budgets = [
        makeBudget({ estimated_cost: 5000, actual_cost: 8000 }),
      ];
      expect(calcPercentUsed(budgets)).toBe(100);
    });

    it("rounds to nearest integer", () => {
      const budgets = [
        makeBudget({ estimated_cost: 3000, actual_cost: 1000 }),
      ];
      expect(calcPercentUsed(budgets)).toBe(33);
    });
  });

  describe("getProgressColorClass", () => {
    it("returns emerald for < 75%", () => {
      expect(getProgressColorClass(50)).toBe("bg-emerald-500");
      expect(getProgressColorClass(74)).toBe("bg-emerald-500");
    });

    it("returns amber for 75-90%", () => {
      expect(getProgressColorClass(75)).toBe("bg-amber-400");
      expect(getProgressColorClass(90)).toBe("bg-amber-400");
    });

    it("returns rose for > 90%", () => {
      expect(getProgressColorClass(91)).toBe("bg-rose-500");
      expect(getProgressColorClass(100)).toBe("bg-rose-500");
    });
  });

  describe("groupByCategory", () => {
    it("returns empty array for no budgets", () => {
      expect(groupByCategory([])).toEqual([]);
    });

    it("returns unique categories", () => {
      const budgets = [
        makeBudget({ category: "Venue & Catering" }),
        makeBudget({ category: "Photography" }),
        makeBudget({ category: "Venue & Catering" }),
        makeBudget({ category: "Floral & Decor" }),
      ];
      const categories = groupByCategory(budgets);
      expect(categories).toHaveLength(3);
      expect(categories).toContain("Venue & Catering");
      expect(categories).toContain("Photography");
      expect(categories).toContain("Floral & Decor");
    });
  });
});
