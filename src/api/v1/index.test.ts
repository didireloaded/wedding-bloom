import { describe, it, expect, vi } from "vitest";
import { APIv1 } from "./index";
import { WeddingService } from "@/services/WeddingService";

vi.mock("@/services/WeddingService", () => ({
  WeddingService: {
    getPublicWeddingPayload: vi.fn().mockImplementation(async (slug: string) => {
      if (slug === "chateau-dream") {
        return { wedding: { id: "wed-1", slug: "chateau-dream", couple_names: "Alice & Bob" }, events: [] };
      }
      return { wedding: null };
    }),
  },
}));

describe("APIv1 Contract Layer", () => {
  it("should format success envelopes correctly", () => {
    const res = APIv1.success({ test: true });
    expect(res.apiVersion).toBe("1.0");
    expect(res.data).toEqual({ test: true });
    expect(res.error).toBeUndefined();
    expect(typeof res.timestamp).toBe("string");
  });

  it("should format error envelopes correctly", () => {
    const res = APIv1.error("UNAUTHORIZED", "Access token missing");
    expect(res.apiVersion).toBe("1.0");
    expect(res.error).toEqual({ code: "UNAUTHORIZED", message: "Access token missing" });
    expect(res.data).toBeUndefined();
  });

  it("should return celebration data for existing slug", async () => {
    const res = await APIv1.getCelebration("chateau-dream");
    expect(res.data?.wedding?.couple_names).toBe("Alice & Bob");
  });

  it("should return NOT_FOUND error for non-existing slug", async () => {
    const res = await APIv1.getCelebration("missing-slug");
    expect(res.error?.code).toBe("NOT_FOUND");
  });

  it("should return health status", () => {
    const res = APIv1.getHealthStatus();
    expect(res.data?.status).toBe("OK");
    expect(typeof res.data?.uptimeSeconds).toBe("number");
  });
});
