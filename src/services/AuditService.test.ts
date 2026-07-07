import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuditService } from "./AuditService";
import { supabase } from "@/utils/supabase";

vi.mock("@/utils/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("AuditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should compute accurate diffs between before and after states", () => {
    const before = { title: "Old Title", date: "2026-08-01", status: "draft" };
    const after = { title: "New Title", date: "2026-08-01", status: "published" };

    const diff = AuditService.computeDiff(before, after);

    expect(diff).toEqual({
      title: { from: "Old Title", to: "New Title" },
      status: { from: "draft", to: "published" },
    });
    expect(diff.date).toBeUndefined(); // Unchanged field omitted
  });

  it("should handle null before or after states in computeDiff", () => {
    expect(AuditService.computeDiff(null, { id: 1 })).toEqual({ _entity: { from: null, to: "CREATED" } });
    expect(AuditService.computeDiff({ id: 1 }, null)).toEqual({ _entity: { from: "EXISTING", to: "DELETED" } });
  });

  it("should insert audit log entry into Supabase database", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    await AuditService.log({
      who: "admin@forevervow.studio",
      what: "UPDATE",
      where: "WeddingSettingsModal",
      entityType: "wedding",
      entityId: "wed-123",
      before: { budget: 10000 },
      after: { budget: 15000 },
    });

    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        who: "admin@forevervow.studio",
        what: "UPDATE",
        entity_type: "wedding",
        entity_id: "wed-123",
        before_state: { budget: 10000 },
        after_state: { budget: 15000 },
      }),
    ]);
  });

  it("should retrieve formatted audit trail from database", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "log-1",
                who: "couple@example.com",
                what: "PUBLISH",
                when_timestamp: "2026-07-07T10:00:00Z",
                where_location: "Cockpit",
                entity_type: "wedding",
                entity_id: "wed-123",
                before_state: { is_published: false },
                after_state: { is_published: true },
              },
            ],
            error: null,
          }),
        }),
      }),
    });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const trail = await AuditService.getAuditTrail("wedding", "wed-123");

    expect(trail).toHaveLength(1);
    expect(trail[0]).toEqual({
      id: "log-1",
      who: "couple@example.com",
      what: "PUBLISH",
      when: "2026-07-07T10:00:00Z",
      where: "Cockpit",
      entityType: "wedding",
      entityId: "wed-123",
      before: { is_published: false },
      after: { is_published: true },
      metadata: undefined,
    });
  });
});
