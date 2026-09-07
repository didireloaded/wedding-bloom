import { describe, expect, it } from "vitest";
import { featuredWeddingForWeek, type PublishedWedding } from "./usePublishedWeddings";

const wedding = (id: string): PublishedWedding => ({
  id,
  slug: id,
  couple_names: id,
  wedding_date: null,
  ceremony_venue: null,
  cover_image: id + ".jpg",
});

describe("featured wedding rotation", () => {
  it("keeps the same featured wedding throughout a week", () => {
    const weddings = [wedding("one"), wedding("two"), wedding("three")];
    expect(featuredWeddingForWeek(weddings, new Date("2026-09-07T08:00:00Z"))?.id)
      .toBe(featuredWeddingForWeek(weddings, new Date("2026-09-09T18:00:00Z"))?.id);
  });

  it("returns no feature when there are no published wedding photos", () => {
    expect(featuredWeddingForWeek([], new Date("2026-09-07T08:00:00Z"))).toBeNull();
  });
});
