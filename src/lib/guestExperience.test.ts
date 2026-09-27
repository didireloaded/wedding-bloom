import { describe, expect, it } from "vitest";
import { resolveGuestExperience } from "./guestExperience";

describe("guest navigation after RSVP", () => {
  it("keeps RSVP available before a confirmed response", () => {
    expect(resolveGuestExperience("upcoming", "rsvp_pending").tabs).toContain("rsvp");
  });

  it("shows a confirmed guest their seat without repeating the RSVP tab", () => {
    const experience = resolveGuestExperience("upcoming", "rsvp_confirmed", true);
    expect(experience.tabs).toContain("seat");
    expect(experience.tabs).not.toContain("rsvp");
    expect(experience.primary).toBe("Find my table");
  });

  it("keeps venue information when seating has not been published", () => {
    const experience = resolveGuestExperience("upcoming", "rsvp_confirmed");
    expect(experience.tabs).toContain("venue");
    expect(experience.tabs).not.toContain("seat");
  });
});
