import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchService } from "./SearchService";

vi.mock("@/repositories", () => {
  return {
    WeddingRepository: class {
      findAll = vi.fn().mockResolvedValue({
        data: [
          { id: "wed-1", couple_names: "Alice & Bob", slug: "alice-bob", ceremony_venue: "Château de Versailles" },
          { id: "wed-2", couple_names: "Charlie & Dana", slug: "charlie-dana", ceremony_venue: "Villa Balbiano" },
        ],
      });
    },
    EventRepository: class {
      findByWeddingIdOrdered = vi.fn().mockResolvedValue([
        { id: "ev-1", title: "Sunset Cocktail Hour", location: "Garden Terrace", event_time: "17:00" },
      ]);
    },
    TaskRepository: class {
      findByWeddingId = vi.fn().mockResolvedValue({
        data: [{ id: "tk-1", title: "Confirm DJ Playlist", category: "Music", status: "todo" }],
      });
    },
    GuestRepository: class {
      findByWeddingId = vi.fn().mockResolvedValue({
        data: [{ id: "gt-1", first_name: "Eleanor", last_name: "Vance", email: "eleanor@example.com", rsvp_status: "confirmed" }],
      });
    },
  };
});

describe("SearchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for queries shorter than 2 characters", async () => {
    const res = await SearchService.searchAll("a");
    expect(res).toEqual([]);
  });

  it("should search across weddings when no weddingId scope is provided", async () => {
    const res = await SearchService.searchAll("Alice");
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: "wed-1",
      type: "wedding",
      title: "Alice & Bob",
      subtitle: "📍 Château de Versailles • 📅 TBD",
      url: "/wedding/alice-bob",
      metadata: { slug: "alice-bob", published: undefined },
    });
  });

  it("should search events, tasks, and guests when scoped to a weddingId", async () => {
    const res = await SearchService.searchAll("Cocktail", "wed-1");
    expect(res).toHaveLength(1);
    expect(res[0].type).toBe("event");
    expect(res[0].title).toBe("Sunset Cocktail Hour");

    const taskRes = await SearchService.searchAll("Playlist", "wed-1");
    expect(taskRes).toHaveLength(1);
    expect(taskRes[0].type).toBe("task");

    const guestRes = await SearchService.searchAll("Eleanor", "wed-1");
    expect(guestRes).toHaveLength(1);
    expect(guestRes[0].type).toBe("guest");
  });
});
