/**
 * ForeverVow — Feature Flag Definitions & Defaults
 * Typed feature toggles for safe releases and progressive rollouts.
 */

export const FeatureFlag = {
  LIVE_WEDDING: "LIVE_WEDDING",
  AI_CSV_IMPORT: "AI_CSV_IMPORT",
  GPS_JOURNEY: "GPS_JOURNEY",
  PAYMENTS: "PAYMENTS",
  VENDOR_PORTAL: "VENDOR_PORTAL",
  MEMORY_BOOK_PDF: "MEMORY_BOOK_PDF",
} as const;

export type FeatureFlag = (typeof FeatureFlag)[keyof typeof FeatureFlag];

/**
 * Default feature flag states.
 * When the Supabase database table `feature_flags` is unreachable or not yet seeded,
 * the application will safely fall back to these default values.
 */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.LIVE_WEDDING]: true,      // Enabled: Core live day-of mode
  [FeatureFlag.AI_CSV_IMPORT]: true,     // Enabled: Smart guest list CSV importer
  [FeatureFlag.GPS_JOURNEY]: false,      // Disabled by default: GPS geofence arrival radar
  [FeatureFlag.PAYMENTS]: false,         // Disabled by default: Stripe registry & payment collection
  [FeatureFlag.VENDOR_PORTAL]: false,    // Disabled by default: Vendor self-service portal
  [FeatureFlag.MEMORY_BOOK_PDF]: false,  // Disabled by default: Automated PDF keepsakes
};

/** Metadata describing each feature flag for Admin UI presentation */
export const FEATURE_FLAG_METADATA: Record<FeatureFlag, { label: string; description: string; category: string }> = {
  [FeatureFlag.LIVE_WEDDING]: {
    label: "Live Day-of Mode",
    description: "Activates the real-time celebration cockpit, guest arrivals, and check-in workflows.",
    category: "Core Celebration",
  },
  [FeatureFlag.AI_CSV_IMPORT]: {
    label: "AI-Powered Guest Import",
    description: "Allows couples to import unstructured Excel/CSV spreadsheets using intelligent column mapping.",
    category: "Data Ingestion",
  },
  [FeatureFlag.GPS_JOURNEY]: {
    label: "GPS Arrival Radar",
    description: "Enables 100m geofence detection to automatically notify coordinators when VIP guests arrive.",
    category: "Experimental / Day-of",
  },
  [FeatureFlag.PAYMENTS]: {
    label: "Stripe Payment Collection",
    description: "Enables cash fund registry gifts, ticketing, and vendor invoice settlements.",
    category: "Billing & Commerce",
  },
  [FeatureFlag.VENDOR_PORTAL]: {
    label: "Vendor Self-Service Portal",
    description: "Gives collaborating planners, photographers, and caterers scoped access to timeline run-sheets.",
    category: "Collaboration",
  },
  [FeatureFlag.MEMORY_BOOK_PDF]: {
    label: "Automated PDF Keepsake",
    description: "Generates a print-ready PDF memory book from approved guest wall moments and photos.",
    category: "Post-Celebration",
  },
};
