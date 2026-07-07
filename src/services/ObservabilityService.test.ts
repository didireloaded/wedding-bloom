import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObservabilityService } from "./ObservabilityService";
import { AnalyticsService } from "./AnalyticsService";

vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      from: (table: string) => ({
        insert: async (payload: any) => {
          if (table === "platform_health_logs" || table === "analytics") {
            return { data: payload, error: null };
          }
          return { data: null, error: new Error("Table error") };
        },
        select: (cols: string) => ({
          limit: async () => ({ data: [{ id: "test" }], error: null }),
          eq: () => ({
            eq: () => ({
              count: "exact",
              head: true
            })
          })
        })
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null })
      }
    }
  };
});

describe("ObservabilityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes Sentry in console simulation mode when no DSN is provided", () => {
    const res = ObservabilityService.initSentry();
    expect(res.initialized).toBe(true);
  });

  it("initializes Sentry with provided DSN", () => {
    const res = ObservabilityService.initSentry("https://key@sentry.io/12345");
    expect(res.initialized).toBe(true);
    expect(res.dsn).toBe("https://key@sentry.io/12345");
  });

  it("captures breadcrumbs and attaches them to exception reports", async () => {
    ObservabilityService.captureBreadcrumb("ui", "Clicked RSVP button");
    ObservabilityService.captureBreadcrumb("network", "Fetched guest list");
    
    // Should not throw
    await expect(ObservabilityService.logException("Test exception", { userId: "user-1" })).resolves.not.toThrow();
  });

  it("logs session start and end without throwing", () => {
    expect(() => ObservabilityService.logSessionStart("user-123", "admin")).not.toThrow();
    expect(() => ObservabilityService.logSessionEnd("user-123")).not.toThrow();
  });

  it("tracks latency and returns result of successful operation", async () => {
    const mockFn = async () => "success";
    const res = await ObservabilityService.trackLatency("test_op", mockFn);
    expect(res).toBe("success");
  });
});

describe("AnalyticsService", () => {
  it("tracks conversion funnel steps and emits telemetry", async () => {
    const spy = vi.spyOn(console, "info");
    await AnalyticsService.trackConversionFunnel("wedding-1", "rsvp_started", { source: "qr_code" });
    expect(spy).toHaveBeenCalledWith(
      "[Analytics Funnel] Step: rsvp_started",
      expect.objectContaining({
        wedding_id: "wedding-1",
        event_type: "rsvp_started",
        metadata: { source: "qr_code" }
      })
    );
  });
});
