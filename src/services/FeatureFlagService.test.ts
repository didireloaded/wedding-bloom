import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeatureFlagService } from "./FeatureFlagService";
import { FeatureFlag, DEFAULT_FEATURE_FLAGS } from "@/config";
import { supabase } from "@/utils/supabase";

vi.mock("@/utils/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("FeatureFlagService", () => {
  beforeEach(() => {
    FeatureFlagService.resetToDefaults();
    vi.clearAllMocks();
  });

  it("should initialize with default feature flags", () => {
    expect(FeatureFlagService.isEnabled(FeatureFlag.LIVE_WEDDING)).toBe(DEFAULT_FEATURE_FLAGS.LIVE_WEDDING);
    expect(FeatureFlagService.isEnabled(FeatureFlag.PAYMENTS)).toBe(DEFAULT_FEATURE_FLAGS.PAYMENTS);
    expect(FeatureFlagService.isEnabled(FeatureFlag.GPS_JOURNEY)).toBe(DEFAULT_FEATURE_FLAGS.GPS_JOURNEY);
  });

  it("should allow runtime overriding of feature flags in memory", () => {
    expect(FeatureFlagService.isEnabled(FeatureFlag.PAYMENTS)).toBe(false);
    FeatureFlagService.setFlag(FeatureFlag.PAYMENTS, true);
    expect(FeatureFlagService.isEnabled(FeatureFlag.PAYMENTS)).toBe(true);
  });

  it("should return all flags via getAll()", () => {
    const all = FeatureFlagService.getAll();
    expect(all).toHaveProperty(FeatureFlag.LIVE_WEDDING);
    expect(all).toHaveProperty(FeatureFlag.AI_CSV_IMPORT);
    expect(all).toHaveProperty(FeatureFlag.VENDOR_PORTAL);
  });

  it("should safely retain defaults if database query fails during refresh()", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { message: "Table not found" } }),
    });

    await FeatureFlagService.refresh();
    expect(FeatureFlagService.isEnabled(FeatureFlag.LIVE_WEDDING)).toBe(true);
    expect(FeatureFlagService.isEnabled(FeatureFlag.PAYMENTS)).toBe(false);
  });

  it("should update local state when refresh() fetches database overrides", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { key: FeatureFlag.PAYMENTS, enabled: true },
          { key: FeatureFlag.GPS_JOURNEY, enabled: true },
        ],
        error: null,
      }),
    });

    await FeatureFlagService.refresh();
    expect(FeatureFlagService.isEnabled(FeatureFlag.PAYMENTS)).toBe(true);
    expect(FeatureFlagService.isEnabled(FeatureFlag.GPS_JOURNEY)).toBe(true);
    expect(FeatureFlagService.isEnabled(FeatureFlag.LIVE_WEDDING)).toBe(true); // Retained default
  });

  it("should perform optimistic update and call upsert in updateInDb()", async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

    const res = await FeatureFlagService.updateInDb(FeatureFlag.VENDOR_PORTAL, true);

    expect(res.success).toBe(true);
    expect(FeatureFlagService.isEnabled(FeatureFlag.VENDOR_PORTAL)).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ key: FeatureFlag.VENDOR_PORTAL, enabled: true })]),
      { onConflict: "key" }
    );
  });
});
