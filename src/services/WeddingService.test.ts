import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/utils/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      select: (...args: unknown[]) => {
        mockSelect(table, ...args);
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return {
              maybeSingle: () => {
                mockMaybeSingle(table, col, val);
                if (table === "weddings" && val === "existing-slug") {
                  return Promise.resolve({ data: { id: "w-1", slug: "existing-slug" }, error: null });
                }
                if (table === "weddings" && col === "id" && val === "source-id") {
                  return Promise.resolve({
                    data: {
                      id: "source-id",
                      slug: "source-slug",
                      couple_names: "Original Couple",
                      wedding_date: "2026-08-01",
                      ceremony_venue: "Grand Hall",
                      published: true,
                    },
                    error: null
                  });
                }
                return Promise.resolve({ data: null, error: null });
              },
              single: () => {
                mockSingle(table, col, val);
                if (table === "weddings" && val === "w-1") {
                  return Promise.resolve({ data: { id: "w-1", couple_names: "Romeo & Juliet", slug: "romeo-juliet" }, error: null });
                }
                if (table === "weddings" && (val === "source-id" || col === "id")) {
                  return Promise.resolve({
                    data: {
                      id: "source-id",
                      slug: "source-slug",
                      couple_names: "Original Couple",
                      wedding_date: "2026-08-01",
                      ceremony_venue: "Grand Hall",
                      published: true,
                    },
                    error: null
                  });
                }
                return Promise.resolve({ data: null, error: null });
              },
              order: () => Promise.resolve({ data: [], error: null }),
            };
          },
          order: () => Promise.resolve({ data: [], error: null }),
        };
      },
      insert: (rows: unknown[]) => {
        mockInsert(table, rows);
        const row = (Array.isArray(rows) ? rows[0] : rows) as Record<string, unknown>;
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: `id-${Math.random().toString(36).substring(2, 6)}`, ...row },
              error: null
            })
          })
        };
      },
      update: (patch: unknown) => {
        mockUpdate(table, patch);
        const p = patch as Record<string, unknown>;
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: val, couple_names: "Updated Couple", slug: "updated-slug", ...p },
                  error: null
                })
              })
            };
          }
        };
      },
      delete: () => {
        mockDelete(table);
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return Promise.resolve({ error: null });
          }
        };
      },
    }),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      select: (...args: unknown[]) => {
        mockSelect(table, ...args);
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return {
              maybeSingle: () => {
                mockMaybeSingle(table, col, val);
                if (table === "weddings" && val === "existing-slug") {
                  return Promise.resolve({ data: { id: "w-1", slug: "existing-slug" }, error: null });
                }
                if (table === "weddings" && col === "id" && val === "source-id") {
                  return Promise.resolve({
                    data: {
                      id: "source-id",
                      slug: "source-slug",
                      couple_names: "Original Couple",
                      wedding_date: "2026-08-01",
                      ceremony_venue: "Grand Hall",
                      published: true,
                    },
                    error: null
                  });
                }
                return Promise.resolve({ data: null, error: null });
              },
              single: () => {
                mockSingle(table, col, val);
                if (table === "weddings" && val === "w-1") {
                  return Promise.resolve({ data: { id: "w-1", couple_names: "Romeo & Juliet", slug: "romeo-juliet" }, error: null });
                }
                if (table === "weddings" && (val === "source-id" || col === "id")) {
                  return Promise.resolve({
                    data: {
                      id: "source-id",
                      slug: "source-slug",
                      couple_names: "Original Couple",
                      wedding_date: "2026-08-01",
                      ceremony_venue: "Grand Hall",
                      published: true,
                    },
                    error: null
                  });
                }
                return Promise.resolve({ data: null, error: null });
              },
              order: () => Promise.resolve({ data: [], error: null }),
            };
          },
          order: () => Promise.resolve({ data: [], error: null }),
        };
      },
      insert: (rows: unknown[]) => {
        mockInsert(table, rows);
        const row = (Array.isArray(rows) ? rows[0] : rows) as Record<string, unknown>;
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: `id-${Math.random().toString(36).substring(2, 6)}`, ...row },
              error: null
            })
          })
        };
      },
      update: (patch: unknown) => {
        mockUpdate(table, patch);
        const p = patch as Record<string, unknown>;
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: val, couple_names: "Updated Couple", slug: "updated-slug", ...p },
                  error: null
                })
              })
            };
          }
        };
      },
      delete: () => {
        mockDelete(table);
        return {
          eq: (col: string, val: unknown) => {
            mockEq(table, col, val);
            return Promise.resolve({ error: null });
          }
        };
      },
    }),
  },
}));

import { WeddingService } from "@/services/WeddingService";

describe("WeddingService Lifecycle & Automation Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateUniqueSlug()", () => {
    it("generates a clean slug when no collision exists", async () => {
      const slug = await WeddingService.generateUniqueSlug("Elena & Marcus");
      expect(slug).toBe("elena-marcus");
    });

    it("appends random digits when collision occurs", async () => {
      const slug = await WeddingService.generateUniqueSlug("existing slug");
      expect(slug).toMatch(/^existing-slug-\d{4}$/);
    });
  });

  describe("generateAccessCode()", () => {
    it("generates an 8-character uppercase alphanumeric code", () => {
      const code = WeddingService.generateAccessCode("Elena & Marcus");
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
      expect(code.startsWith("ELEN")).toBe(true);
    });
  });

  describe("createWeddingWithDefaults()", () => {
    it("provisions a wedding with default events, tasks, budgets, and QR codes", async () => {
      const { data: wedding, error } = await WeddingService.createWeddingWithDefaults({
        couple_names: "Romeo & Juliet",
        wedding_date: "2026-09-15",
      });

      expect(error).toBeNull();
      expect(wedding).toBeDefined();
      expect(wedding?.couple_names).toBe("Romeo & Juliet");
      expect(wedding?.slug).toBe("romeo-juliet-2026");
      expect(wedding?.access_code).toHaveLength(8);

      // Check insertions across tables
      expect(mockInsert).toHaveBeenCalledWith("weddings", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("couples", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("events", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("tasks", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("budgets", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("qr_codes", expect.any(Array));
    });
  });

  describe("duplicateWedding()", () => {
    it("deep copies a wedding and generates new access credentials and QR codes", async () => {
      const { data: copy, error } = await WeddingService.duplicateWedding("source-id", "Original Couple Copy");

      expect(error).toBeNull();
      expect(copy).toBeDefined();
      expect(copy?.couple_names).toBe("Original Couple Copy");
      expect(copy?.slug).toBe("original-couple-copy");
      expect(copy?.published).toBe(false);

      expect(mockInsert).toHaveBeenCalledWith("weddings", expect.any(Array));
      expect(mockInsert).toHaveBeenCalledWith("qr_codes", expect.any(Array));
    });
  });

  describe("archiveWedding()", () => {
    it("unpublishes the wedding and records archive activity", async () => {
      const { data, error } = await WeddingService.archiveWedding("w-1");
      expect(error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith("weddings", { published: false });
    });
  });

  describe("deleteWedding()", () => {
    it("deletes the wedding record from repository", async () => {
      const { success, error } = await WeddingService.deleteWedding("w-1");
      expect(error).toBeNull();
      expect(success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith("weddings");
    });
  });

  describe("createInvitationLink()", () => {
    it("creates a tracked invitation link with unique token", async () => {
      const { data, error } = await WeddingService.createInvitationLink("w-1", "g-1");
      expect(error).toBeNull();
      expect(data?.unique_token).toBeDefined();
      expect(mockInsert).toHaveBeenCalledWith("invitation_links", expect.any(Array));
    });
  });
});
