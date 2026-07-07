/**
 * ForeverVow — Feature Flag Service
 * Runtime feature toggles with Supabase sync and safe offline fallbacks.
 */

import { supabase } from "@/utils/supabase";
import { FeatureFlag, DEFAULT_FEATURE_FLAGS } from "@/config";

export class FeatureFlagService {
  private static flags: Record<FeatureFlag, boolean> = { ...DEFAULT_FEATURE_FLAGS };
  private static isInitialized = false;

  /**
   * Check if a feature flag is currently enabled.
   */
  static isEnabled(flag: FeatureFlag): boolean {
    return Boolean(this.flags[flag] ?? DEFAULT_FEATURE_FLAGS[flag] ?? false);
  }

  /**
   * Get all feature flags and their current state.
   */
  static getAll(): Record<FeatureFlag, boolean> {
    return { ...this.flags };
  }

  /**
   * Manually override a flag in memory (useful for testing or instant runtime toggles).
   */
  static setFlag(flag: FeatureFlag, enabled: boolean): void {
    this.flags[flag] = enabled;
  }

  /**
   * Reset all flags back to system defaults.
   */
  static resetToDefaults(): void {
    this.flags = { ...DEFAULT_FEATURE_FLAGS };
  }

  /**
   * Fetch latest feature flag states from Supabase `feature_flags` table.
   * Gracefully falls back to current/default values if table is missing or offline.
   */
  static async refresh(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("key, enabled");

      if (error || !data) {
        if (!this.isInitialized) {
          console.warn("[FeatureFlagService] Using offline defaults. Could not fetch from DB:", error?.message);
        }
        return;
      }

      const updated: Record<string, boolean> = { ...this.flags };
      for (const row of data) {
        if (row && typeof row.key === "string" && typeof row.enabled === "boolean") {
          updated[row.key as FeatureFlag] = row.enabled;
        }
      }

      this.flags = updated as Record<FeatureFlag, boolean>;
      this.isInitialized = true;
    } catch (err) {
      console.error("[FeatureFlagService] Unexpected error refreshing flags:", err);
    }
  }

  /**
   * Persist a flag toggle to the database (for Admin use).
   */
  static async updateInDb(flag: FeatureFlag, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      this.setFlag(flag, enabled); // Optimistic update

      const { error } = await (supabase.from("feature_flags") as any)
        .upsert([{ key: flag, enabled, updated_at: new Date().toISOString() }], { onConflict: "key" });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update feature flag" };
    }
  }
}
