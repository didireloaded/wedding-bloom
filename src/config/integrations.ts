/**
 * ForeverVow — Third-Party Integration Configuration
 * Centralized settings for all external SDKs and services.
 */

import { ENV } from "./app";

export interface IntegrationConfig {
  enabled: boolean;
  provider: string;
  apiKey?: string;
  endpoint?: string;
  metadata?: Record<string, any>;
}

export const INTEGRATIONS = {
  sentry: {
    enabled: Boolean(ENV.sentryDsn),
    provider: "Sentry",
    dsn: ENV.sentryDsn,
    environment: ENV.mode || "development",
    tracesSampleRate: ENV.isProd ? 0.2 : 1.0,
  },
  posthog: {
    enabled: Boolean(ENV.posthogKey),
    provider: "PostHog",
    apiKey: ENV.posthogKey,
    apiHost: "https://app.posthog.com",
  },
  resend: {
    enabled: Boolean(ENV.resendApiKey),
    provider: "Resend",
    apiKey: ENV.resendApiKey,
    defaultFromEmail: "concierge@forevervow.studio",
    defaultFromName: "ForeverVow Concierge",
  },
  stripe: {
    enabled: Boolean(ENV.stripePublishableKey),
    provider: "Stripe",
    publishableKey: ENV.stripePublishableKey,
    currency: "usd",
  },
  cloudinary: {
    enabled: Boolean(ENV.cloudinaryCloudName),
    provider: "Cloudinary",
    cloudName: ENV.cloudinaryCloudName,
    uploadPreset: "forevervow_guest_media",
  },
  googleMaps: {
    enabled: Boolean(ENV.googleMapsApiKey),
    provider: "Google Maps",
    apiKey: ENV.googleMapsApiKey,
    defaultCenter: { lat: 48.8566, lng: 2.3522 }, // Paris default (Château vibe)
    defaultZoom: 14,
  },
} as const;
