import { describe, it, expect } from "vitest";
import { rsvpSubmissionSchema, weddingProfileSchema, guestInvitationSchema } from "./index";

describe("Zod Runtime Validators", () => {
  describe("rsvpSubmissionSchema", () => {
    it("should validate a correct attending RSVP payload", () => {
      const validPayload = {
        wedding_id: "123e4567-e89b-12d3-a456-426614174000",
        guest_name: "Alexander Vance",
        email: "alexander@example.com",
        attending: "confirmed" as const,
        guest_count: 2,
        dietary_preference: "Vegetarian",
      };
      const result = rsvpSubmissionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should fail validation if guest count is greater than 20", () => {
      const invalidPayload = {
        wedding_id: "123e4567-e89b-12d3-a456-426614174000",
        guest_name: "Alexander Vance",
        attending: "yes" as const,
        guest_count: 25,
      };
      const result = rsvpSubmissionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Maximum 20 guests per party");
      }
    });

    it("should fail validation if attending status is invalid", () => {
      const invalidPayload = {
        wedding_id: "123e4567-e89b-12d3-a456-426614174000",
        guest_name: "Alexander Vance",
        attending: "maybe-later",
        guest_count: 1,
      };
      const result = rsvpSubmissionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("weddingProfileSchema", () => {
    it("should validate a valid wedding profile", () => {
      const validProfile = {
        couple_names: "Elena & Marcus",
        slug: "elena-marcus-2026",
        access_code: "VOWS26",
      };
      const result = weddingProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("should fail validation if slug contains uppercase letters or spaces", () => {
      const invalidProfile = {
        couple_names: "Elena & Marcus",
        slug: "Elena Marcus 2026",
        access_code: "VOWS26",
      };
      const result = weddingProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Slug can only contain lowercase letters, numbers, and hyphens");
      }
    });
  });

  describe("guestInvitationSchema", () => {
    it("should validate and apply default status 'invited'", () => {
      const payload = {
        wedding_id: "wed-123",
        name: "Lord Sterling",
      };
      const result = guestInvitationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("invited");
      }
    });
  });
});
