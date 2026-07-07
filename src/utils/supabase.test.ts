import { describe, it, expect, vi } from "vitest";

describe("Supabase Client Initialization", () => {
  it("throws when VITE_SUPABASE_URL is missing", async () => {
    // Reset module registry
    vi.resetModules();

    // Mock import.meta.env with missing URL
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-key");

    await expect(async () => {
      await import("@/utils/supabase");
    }).rejects.toThrow("Missing required environment variables");
  });

  it("throws when VITE_SUPABASE_PUBLISHABLE_KEY is missing", async () => {
    vi.resetModules();

    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    await expect(async () => {
      await import("@/utils/supabase");
    }).rejects.toThrow("Missing required environment variables");
  });

  it("creates client when both env vars are present", async () => {
    vi.resetModules();

    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-anon-key-12345");

    const mod = await import("@/utils/supabase");
    expect(mod.supabase).toBeDefined();
    expect(typeof mod.submitRSVPToBackend).toBe("function");
  });
});
