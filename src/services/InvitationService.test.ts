import { describe, it, expect, beforeEach, vi } from "vitest";
import { InvitationService } from "./InvitationService";

vi.mock("@/repositories", () => ({
  InvitationLinkRepository: class {
    create = vi.fn().mockResolvedValue({
      data: { id: "link-1", wedding_id: "wed-1", label: "VIP Invite", url: "https://forevervow.app/wedding/demo?invite=tok123", token: "tok123", clicks: 0 },
      error: null,
    });
    findByToken = vi.fn().mockImplementation(async (tok: string) => {
      if (tok === "tok123") {
        return { data: { id: "link-1", wedding_id: "wed-1", label: "VIP Invite", token: "tok123", clicks: 5 }, error: null };
      }
      return { data: null, error: "Not found" };
    });
    incrementClicks = vi.fn().mockResolvedValue({ success: true });
  },
  GuestRepository: class {},
  WeddingRepository: class {
    findById = vi.fn().mockResolvedValue({ data: { id: "wed-1", couple_names: "Alice & Bob" } });
  },
}));

vi.mock("./integrations/IntegrationGateway", () => ({
  IntegrationGateway: {
    email: {
      sendEmail: vi.fn().mockResolvedValue({ success: true, id: "email-123" }),
    },
    analytics: {
      trackEvent: vi.fn(),
      identifyUser: vi.fn(),
    },
    push: {
      sendTopicPushNotification: vi.fn().mockResolvedValue({ success: true }),
    },
    sessionReplay: {
      tagSession: vi.fn(),
    },
    monitoring: {
      captureMessage: vi.fn(),
      captureException: vi.fn(),
    },
  },
}));

vi.mock("./AuditService", () => ({
  AuditService: { log: vi.fn().mockResolvedValue(true) },
}));

describe("InvitationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a unique invitation link", async () => {
    const res = await InvitationService.generateInvitationLink("wed-1", "alice-bob", "guest-1", "VIP Invite");
    expect(res.data).toBeDefined();
    expect(res.data?.label).toBe("VIP Invite");
    expect(res.data?.url).toContain("invite=");
  });

  it("should validate an existing invitation token and increment clicks", async () => {
    const res = await InvitationService.validateInvitationToken("tok123");
    expect(res.valid).toBe(true);
    expect(res.link?.label).toBe("VIP Invite");
  });

  it("should return invalid for non-existing token", async () => {
    const res = await InvitationService.validateInvitationToken("invalid-tok");
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Invalid or expired invitation token");
  });

  it("should dispatch invitation email via Integration Gateway", async () => {
    const res = await InvitationService.dispatchInvitationEmail("wed-1", "guest@example.com", "John Doe", "https://forevervow.app/wedding/demo");
    expect(res.success).toBe(true);
  });
});
