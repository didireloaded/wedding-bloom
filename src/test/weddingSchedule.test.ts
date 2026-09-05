import { describe, expect, it } from "vitest";
import { weddingSchedule } from "../lib/weddingSchedule";

describe("weddingSchedule", () => {
  it("preserves the couple's explicit events", () => {
    const events = [{ id: "one", title: "Dinner", event_time: "18:00", location: null, description: null }];
    expect(weddingSchedule(events, { ceremony_time: "12:00" })).toBe(events);
  });
  it("uses only the current wedding details as a fallback", () => {
    expect(weddingSchedule([], { ceremony_time: "12:00", ceremony_venue: "Garden" })).toEqual([
      { id: "details-ceremony", title: "Ceremony", event_time: "12:00", location: "Garden", description: null },
    ]);
  });
  it("does not fabricate events for an empty wedding", () => {
    expect(weddingSchedule([], {})).toEqual([]);
    expect(weddingSchedule([], null)).toEqual([]);
  });
});
