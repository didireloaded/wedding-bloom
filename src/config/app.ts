/**
 * ForeverVow — Central Application Configuration
 * Single source of truth for all app-wide constants.
 * Never hardcode values in services or components — import from here.
 */

/** Application metadata */
export const APP_CONFIG = {
  name: "ForeverVow",
  version: "1.0.0",
  supportEmail: "support@forevervow.studio",
  brandTagline: "Celebration Studio",
  copyrightYear: new Date().getFullYear(),
} as const;

/** Environment-derived config (validated at import time) */
export const ENV = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  posthogKey: import.meta.env.VITE_POSTHOG_KEY as string | undefined,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PK as string | undefined,
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY as string | undefined,
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD as string | undefined,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

/** Upload and media constraints */
export const MEDIA_LIMITS = {
  maxPhotoSizeBytes: 10 * 1024 * 1024,       // 10 MB
  maxVideoSizeBytes: 100 * 1024 * 1024,       // 100 MB
  maxGalleryPhotos: 200,
  maxGuestPhotosPerWedding: 500,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"] as readonly string[],
  allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"] as readonly string[],
  thumbnailWidth: 400,
  thumbnailQuality: 80,
} as const;

/** Rate limiting defaults */
export const RATE_LIMITS = {
  rsvpSubmissionsPerMinute: 10,
  photoUploadsPerMinute: 5,
  broadcastsPerHour: 20,
  loginAttemptsBeforeLockout: 5,
  loginLockoutWindowMs: 15 * 60 * 1000,       // 15 min
  loginLockoutDurationMs: 5 * 60 * 1000,       // 5 min
} as const;

/** Pagination defaults */
export const PAGINATION = {
  defaultPageSize: 25,
  maxPageSize: 100,
  guestListPageSize: 50,
  activityFeedPageSize: 20,
} as const;

/** Cache TTL defaults (milliseconds) */
export const CACHE_TTL = {
  wedding: 5 * 60 * 1000,      // 5 min
  guests: 2 * 60 * 1000,       // 2 min
  timeline: 5 * 60 * 1000,     // 5 min
  gallery: 3 * 60 * 1000,      // 3 min
  analytics: 1 * 60 * 1000,    // 1 min
  settings: 10 * 60 * 1000,    // 10 min
  featureFlags: 5 * 60 * 1000, // 5 min
} as const;

/** Geofence defaults */
export const GEOFENCE = {
  arrivalRadiusMeters: 100,
  journeyTimeoutMs: 4 * 60 * 60 * 1000,  // 4 hours
} as const;
