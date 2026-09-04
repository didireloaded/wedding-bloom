import { describe, expect, it } from "vitest";
import { getWeddingPhase } from "@/lib/weddingPhase";

const atNoon = (date: string) => new Date(`${date}T12:00:00`);

describe("getWeddingPhase", () => {
  it("keeps unpublished weddings in draft", () => {
    expect(getWeddingPhase({ published: false, wedding_date: "2026-11-21" }, [], atNoon("2026-09-04"))).toBe("draft");
  });

  it("moves an upcoming wedding into RSVP closing three days before", () => {
    expect(getWeddingPhase({ published: true, wedding_date: "2026-09-07" }, [], atNoon("2026-09-04"))).toBe("rsvp_closing");
  });

  it("uses live mode on the wedding day", () => {
    expect(getWeddingPhase({ published: true, live_mode: true, wedding_date: "2026-09-04" }, [], atNoon("2026-09-04"))).toBe("live");
  });

  it("moves from completed into archive after seven days", () => {
    const wedding = { published: true, wedding_date: "2026-09-01" };
    expect(getWeddingPhase(wedding, [], atNoon("2026-09-04"))).toBe("completed");
    expect(getWeddingPhase(wedding, [], atNoon("2026-09-10"))).toBe("archive");
  });
});
