import { describe, it, expect, beforeEach, vi } from "vitest";
import { QRCodeService } from "./QRCodeService";

vi.mock("@/repositories", () => ({
  QRCodeRepository: class {
    create = vi.fn().mockImplementation(async (payload: any) => ({
      data: { id: "qr-" + Math.random().toString(36).substring(2, 6), ...payload },
      error: null,
    }));
    findById = vi.fn().mockImplementation(async (id: string) => {
      if (id === "qr-main") {
        return { data: { id: "qr-main", wedding_id: "wed-1", label: "Main Invitation Portal", target_url: "https://forevervow.app", scans: 10 }, error: null };
      }
      return { data: null, error: "Not found" };
    });
    findByWeddingId = vi.fn().mockResolvedValue({
      data: [
        { id: "qr-main", wedding_id: "wed-1", label: "Main Invitation Portal", target_url: "https://forevervow.app", scans: 10 },
      ],
    });
    incrementScans = vi.fn().mockResolvedValue({ success: true });
  },
}));

vi.mock("./AuditService", () => ({
  AuditService: { log: vi.fn().mockResolvedValue(true) },
}));

describe("QRCodeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a single QR code item", async () => {
    const res = await QRCodeService.generateQRCode("wed-1", "Table 5 Menu", "https://forevervow.app/menu");
    expect(res.data).toBeDefined();
    expect(res.data?.label).toBe("Table 5 Menu");
  });

  it("should generate default set of 3 wedding QR codes", async () => {
    const codes = await QRCodeService.generateDefaultWeddingQRCodes("wed-1", "demo-slug");
    expect(codes).toHaveLength(3);
    expect(codes[0].label).toBe("Main Invitation Portal");
    expect(codes[1].label).toBe("Table Check-in & Guestbook");
    expect(codes[2].label).toBe("Photo Vault Upload");
  });

  it("should track scans and increment scan telemetry", async () => {
    const res = await QRCodeService.trackScan("qr-main");
    expect(res.success).toBe(true);
  });

  it("should return error when scanning non-existent QR code", async () => {
    const res = await QRCodeService.trackScan("qr-missing");
    expect(res.success).toBe(false);
  });

  it("should fetch all QR codes for a wedding", async () => {
    const codes = await QRCodeService.getQRCodesForWedding("wed-1");
    expect(codes).toHaveLength(1);
    expect(codes[0].id).toBe("qr-main");
  });
});
