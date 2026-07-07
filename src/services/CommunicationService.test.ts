import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommunicationService } from "./CommunicationService";
import { supabase } from "@/lib/supabase";
import type { Wedding, RSVP, WeddingEvent } from "@/types/wedding";

// Mock Supabase client
vi.mock("@/lib/supabase", () => {
  const selectMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const singleMock = vi.fn().mockResolvedValue({
    data: { id: "wed-123", couple_names: "Alice & Bob", wedding_date: "2026-10-10" },
    error: null,
  });
  const insertMock = vi.fn().mockResolvedValue({ error: null });

  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === "rsvps") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [
                { id: "rsvp-1", wedding_id: "wed-123", guest_name: "John Doe", email: "john@example.com", attending: "confirmed", vip_status: true, guest_count: 2 },
                { id: "rsvp-2", wedding_id: "wed-123", guest_name: "Jane Smith", email: "jane@example.com", attending: "declined", vip_status: false, guest_count: 1 },
              ],
              error: null,
            }),
          };
        }
        if (table === "weddings") {
          return {
            select: selectMock,
            eq: eqMock,
            single: singleMock,
          };
        }
        if (table === "broadcasts") {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: "broad-1", wedding_id: "wed-123", subject: "Test Broadcast", template: "Logistics Reminder", target: "confirmed", recipient_count: 1 },
              error: null,
            }),
          };
        }
        if (table === "notifications" || table === "activity_log") {
          return {
            insert: insertMock,
          };
        }
        return {
          select: selectMock,
          eq: eqMock,
          single: singleMock,
          insert: insertMock,
        };
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      }),
      removeChannel: vi.fn(),
    },
  };
});

describe("CommunicationService (Sprint 6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Luxury HTML Email Template Renderers", () => {
    const mockWedding: Partial<Wedding> = {
      couple_names: "Elena & Marcus",
      wedding_date: "2026-09-18",
      ceremony_venue: "Villa Balbianello, Lake Como",
      cover_image: "https://example.com/cover.jpg",
    };

    it("should render formal invitation template with correct couple and venue details", () => {
      const html = CommunicationService.renderFormalInvitationTemplate(
        mockWedding,
        "Dr. Alexander Vance",
        "https://forevervow.app/wedding/elena-marcus/rsvp"
      );

      expect(html).toContain("Elena &amp; Marcus");
      expect(html).toContain("Dr. Alexander Vance");
      expect(html).toContain("Villa Balbianello, Lake Como");
      expect(html).toContain("https://forevervow.app/wedding/elena-marcus/rsvp");
      expect(html).toContain("View Invitation &amp; RSVP");
    });

    it("should render RSVP confirmation template with dietary requirements and party count", () => {
      const mockRsvp: Partial<RSVP> = {
        guest_name: "Sophia Rossi",
        attending: "confirmed",
        guest_count: 3,
        dietary_requirements: "Gluten-Free & Vegan",
      };

      const html = CommunicationService.renderRSVPConfirmationTemplate(mockWedding, mockRsvp);

      expect(html).toContain("Joyfully Accepted");
      expect(html).toContain("Sophia Rossi");
      expect(html).toContain("3 Guest(s)");
      expect(html).toContain("Gluten-Free &amp; Vegan");
    });

    it("should render logistics reminder template with timeline events", () => {
      const mockEvents: WeddingEvent[] = [
        { id: "ev-1", wedding_id: "wed-123", title: "Sunset Ceremony", event_time: "5:00 PM", location: "Lakeside Terrace", description: "Arrive 30 mins early", event_date: "2026-09-18", sort_order: 1 },
        { id: "ev-2", wedding_id: "wed-123", title: "Gala Reception", event_time: "7:00 PM", location: "Grand Ballroom", description: "Black tie dinner", event_date: "2026-09-18", sort_order: 2 },
      ];

      const html = CommunicationService.renderLogisticsReminderTemplate(mockWedding, mockEvents);

      expect(html).toContain("Sunset Ceremony");
      expect(html).toContain("5:00 PM");
      expect(html).toContain("Lakeside Terrace");
      expect(html).toContain("Gala Reception");
      expect(html).toContain("Grand Ballroom");
    });

    it("should render day-of broadcast template with urgent message banner", () => {
      const html = CommunicationService.renderDayOfBroadcastTemplate(
        mockWedding,
        "Shuttle Departure Update",
        "The evening shuttles will depart from the main gate at 11:30 PM instead of 11:00 PM."
      );

      expect(html).toContain("Live Celebration Broadcast");
      expect(html).toContain("Shuttle Departure Update");
      expect(html).toContain("11:30 PM instead of 11:00 PM");
    });
  });

  describe("2. Multi-Channel API Delivery & Fallback Audit Logging", () => {
    it("should simulate email delivery and write to activity_log when Resend API key is absent", async () => {
      const res = await CommunicationService.sendEmail("test@example.com", "Test Subject", "<p>Hello</p>", "wed-123");

      expect(res.success).toBe(true);
      expect(res.channel).toBe("email");
      expect(res.id).toContain("sim-email-");
      expect(supabase.from).toHaveBeenCalledWith("activity_log");
    });

    it("should simulate SMS delivery and write to activity_log when Twilio API credentials are absent", async () => {
      const res = await CommunicationService.sendSMS("+1234567890", "Welcome to Forever Vow!", "wed-123");

      expect(res.success).toBe(true);
      expect(res.channel).toBe("sms");
      expect(res.id).toContain("sim-sms-");
      expect(supabase.from).toHaveBeenCalledWith("activity_log");
    });
  });

  describe("3. Broadcast Orchestration & Segment Targeting", () => {
    it("should dispatch broadcast to confirmed segment and log notification", async () => {
      const res = await CommunicationService.dispatchBroadcast(
        "wed-123",
        "Shuttle Schedule & Weather Alert",
        "Logistics Reminder",
        "confirmed",
        ["email", "sms"],
        "Please check the updated shuttle schedule on our website."
      );

      expect(res.error).toBeNull();
      expect(res.recipientCount).toBe(1); // Only John Doe is confirmed in mock
      expect(res.data).toBeDefined();
      expect(supabase.from).toHaveBeenCalledWith("broadcasts");
      expect(supabase.from).toHaveBeenCalledWith("notifications");
    });

    it("should target all households when segment is set to 'all'", async () => {
      const res = await CommunicationService.dispatchBroadcast(
        "wed-123",
        "General Welcome Announcement",
        "Welcome Guide",
        "all",
        ["email"]
      );

      expect(res.error).toBeNull();
      expect(res.recipientCount).toBe(2); // Both John Doe and Jane Smith
    });
  });

  describe("4. Real-Time Notification Subscriptions", () => {
    it("should establish a Supabase Realtime channel subscription", () => {
      const callback = vi.fn();
      const unsubscribe = CommunicationService.subscribeToNotifications("wed-123", callback);

      expect(supabase.channel).toHaveBeenCalledWith("wedding-notifications-wed-123");
      expect(typeof unsubscribe).toBe("function");
    });
  });
});
