import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock supabase before importing store ──
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/utils/supabase", () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      return {
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return Promise.resolve({ data: [], error: null });
            },
          };
        },
        insert: (rows: unknown[]) => {
          mockInsert(rows);
          return Promise.resolve({ data: rows, error: null });
        },
        update: (patch: unknown) => {
          mockUpdate(patch);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return Promise.resolve({ data: null, error: null });
            },
          };
        },
        delete: () => {
          mockDelete();
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  },
}));

// Import store AFTER mock setup
const { store } = await import("@/store/weddingStore");

describe("weddingStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("all()", () => {
    it("returns empty array for unknown table", () => {
      expect(store.all("nonexistent_table")).toEqual([]);
    });

    it("returns cached data after insert", () => {
      store.insert("budgets", {
        wedding_id: "w1",
        category: "Venue",
        item_name: "Hall Rental",
        estimated_cost: 5000,
        actual_cost: 4800,
        deposit_paid: 1000,
        status: "pending",
      });
      const budgets = store.all("budgets");
      expect(budgets.length).toBeGreaterThanOrEqual(1);
      const found = budgets.find((b: Record<string, unknown>) => b.item_name === "Hall Rental");
      expect(found).toBeDefined();
      expect(found!.estimated_cost).toBe(5000);
    });
  });

  describe("find()", () => {
    it("returns undefined when no match", () => {
      const result = store.find("budgets", (b: Record<string, unknown>) => b.item_name === "NONEXISTENT");
      expect(result).toBeUndefined();
    });

    it("returns matching item", () => {
      store.insert("vendors", {
        wedding_id: "w1",
        name: "Test Florist",
        role: "Florist",
      });
      const found = store.find("vendors", (v: Record<string, unknown>) => v.name === "Test Florist");
      expect(found).toBeDefined();
      expect(found!.role).toBe("Florist");
    });
  });

  describe("where()", () => {
    it("filters items by predicate", () => {
      store.insert("budgets", { wedding_id: "w1", category: "Decor", item_name: "Flowers", estimated_cost: 2000, actual_cost: 0, deposit_paid: 0, status: "pending" });
      store.insert("budgets", { wedding_id: "w2", category: "Decor", item_name: "Lights", estimated_cost: 800, actual_cost: 0, deposit_paid: 0, status: "pending" });

      const w1Budgets = store.where("budgets", (b: Record<string, unknown>) => b.wedding_id === "w1");
      expect(w1Budgets.length).toBeGreaterThanOrEqual(1);
      expect(w1Budgets.every((b: Record<string, unknown>) => b.wedding_id === "w1")).toBe(true);
    });
  });

  describe("insert()", () => {
    it("generates id and created_at if not provided", () => {
      const result = store.insert("gifts", {
        wedding_id: "w1",
        guest_name: "Jane",
        gift_item: "Crystal Vase",
        status: "pending",
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.created_at).toBeDefined();
    });

    it("preserves provided id", () => {
      const result = store.insert("gifts", {
        id: "custom-id-123",
        wedding_id: "w1",
        guest_name: "John",
        gift_item: "Photo Album",
        status: "pending",
      });
      expect(result.id).toBe("custom-id-123");
    });

    it("calls supabase insert", async () => {
      store.insert("mood_items", {
        wedding_id: "w1",
        type: "palette",
        title: "Gold",
        value: "#D4A853",
      });
      // Wait for async write
      await new Promise(r => setTimeout(r, 50));
      expect(mockFrom).toHaveBeenCalledWith("mood_items");
    });
  });

  describe("update()", () => {
    it("updates item in cache", () => {
      const inserted = store.insert("vendors", {
        wedding_id: "w1",
        name: "Old Name",
        role: "DJ",
      });
      store.update("vendors", inserted.id as string, { name: "New Name" });
      const found = store.find("vendors", (v: Record<string, unknown>) => v.id === inserted.id);
      expect(found!.name).toBe("New Name");
    });
  });

  describe("remove()", () => {
    it("removes item from cache", () => {
      const inserted = store.insert("gifts", {
        wedding_id: "w1",
        guest_name: "Bob",
        gift_item: "Wine Set",
        status: "pending",
      });
      const id = inserted.id as string;
      store.remove("gifts", id);
      const found = store.find("gifts", (g: Record<string, unknown>) => g.id === id);
      expect(found).toBeUndefined();
    });
  });

  describe("subscribe()", () => {
    it("notifies listeners on insert", async () => {
      const callback = vi.fn();
      const unsub = store.subscribe("budgets", callback);

      store.insert("budgets", {
        wedding_id: "w1",
        category: "Photo",
        item_name: "Photographer",
        estimated_cost: 3000,
        actual_cost: 0,
        deposit_paid: 500,
        status: "pending",
      });

      // Wait for debounced microtask emission
      await new Promise(r => setTimeout(r, 10));
      expect(callback).toHaveBeenCalled();

      unsub();
    });

    it("stops notifying after unsubscribe", async () => {
      const callback = vi.fn();
      const unsub = store.subscribe("vendors", callback);
      unsub();

      store.insert("vendors", { wedding_id: "w1", name: "Unsubbed", role: "Test" });
      await new Promise(r => setTimeout(r, 10));
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
