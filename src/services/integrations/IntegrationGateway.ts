/**
 * ForeverVow — Universal Integration Gateway
 * Enterprise abstraction layer isolating all third-party SDKs and external APIs
 * (SMS, Email, Payments, Wallet, Storage, Maps, Analytics, Monitoring, Search, Push, Session Replay, Deployment).
 * Never call third-party SDKs directly from UI or domain services.
 */

import { INTEGRATIONS } from "@/config";

// --- Provider Interfaces ---

export interface SMSNotificationProvider {
  sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }>;
}

export interface EmailNotificationProvider {
  sendEmail(to: string, subject: string, htmlBody?: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface PaymentGatewayProvider {
  createCheckoutSession(weddingId: string, amountCents: number, currency: string, description?: string): Promise<{ checkoutUrl: string; sessionId: string }>;
}

export interface WalletPassProvider {
  generateAppleWalletPass(weddingId: string, guestName: string, accessCode: string): Promise<Blob | null>;
  generateGoogleWalletPass(weddingId: string, guestName: string, accessCode: string): Promise<string | null>;
}

export interface StorageProvider {
  uploadFile(file: File | Blob, path: string, metadata?: Record<string, any>): Promise<{ url: string; key: string; sizeBytes: number }>;
  deleteFile(key: string): Promise<boolean>;
}

export interface MapsProvider {
  geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null>;
  calculateDistance(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }): Promise<{ distanceMeters: number; durationSeconds: number }>;
}

export interface AnalyticsProvider {
  trackEvent(eventName: string, properties?: Record<string, any>): void;
  identifyUser(userId: string, traits?: Record<string, any>): void;
}

export interface MonitoringProvider {
  captureException(error: Error | unknown, context?: Record<string, any>): void;
  captureMessage(message: string, level?: "info" | "warning" | "error"): void;
}

export interface SearchProvider {
  indexDocument(indexName: string, doc: Record<string, any>): Promise<void>;
  search(indexName: string, query: string, options?: Record<string, any>): Promise<any[]>;
}

export interface PushNotificationProvider {
  sendPushNotification(token: string, title: string, body: string, data?: Record<string, any>): Promise<{ success: boolean; messageId?: string }>;
  sendTopicPushNotification(topic: string, title: string, body: string, data?: Record<string, any>): Promise<{ success: boolean; messageId?: string }>;
}

export interface SessionReplayProvider {
  startRecording(userId?: string, metadata?: Record<string, any>): void;
  tagSession(key: string, value: string): void;
}

export interface DeploymentProvider {
  getDeploymentMetadata(): { environment: "production" | "preview" | "development"; commitRef: string; region: string };
  purgeCDNCache(urls?: string[]): Promise<boolean>;
}

// --- Default Mock / Development Adapters ---

class DefaultMockIntegrationAdapter
  implements
    SMSNotificationProvider,
    EmailNotificationProvider,
    PaymentGatewayProvider,
    WalletPassProvider,
    StorageProvider,
    MapsProvider,
    AnalyticsProvider,
    MonitoringProvider,
    SearchProvider,
    PushNotificationProvider,
    SessionReplayProvider,
    DeploymentProvider
{
  async sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[IntegrationGateway:SMS (Twilio)] Dispatching SMS to ${phoneNumber}: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  }

  async sendEmail(to: string, subject: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[IntegrationGateway:Email (Resend)] Dispatching Email to ${to} [Subject: ${subject}]`);
    return { success: true, messageId: `email_${Date.now()}` };
  }

  async createCheckoutSession(weddingId: string, amountCents: number, currency: string): Promise<{ checkoutUrl: string; sessionId: string }> {
    console.log(`[IntegrationGateway:Stripe] Creating checkout session for wedding ${weddingId} (${amountCents} ${currency})`);
    return {
      checkoutUrl: `${typeof window !== "undefined" ? window.location.origin : "https://forevervow.app"}/checkout/mock?w=${weddingId}&amt=${amountCents}&cur=${currency}`,
      sessionId: `cs_test_${Date.now()}`,
    };
  }

  async generateAppleWalletPass(): Promise<Blob | null> {
    return null;
  }

  async generateGoogleWalletPass(weddingId: string, guestName: string): Promise<string | null> {
    return `https://wallet.google.com/pass/mock_${weddingId}_${encodeURIComponent(guestName)}`;
  }

  async uploadFile(file: File | Blob, path: string): Promise<{ url: string; key: string; sizeBytes: number }> {
    console.log(`[IntegrationGateway:Storage (Supabase/Cloudinary)] Uploading file to ${path} (${file.size} bytes)`);
    return {
      url: `https://mock.storage.forevervow.studio/${path}`,
      key: path,
      sizeBytes: file.size,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    console.log(`[IntegrationGateway:Storage] Deleting file ${key}`);
    return true;
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    console.log(`[IntegrationGateway:Maps (Google)] Geocoding address: "${address}"`);
    return {
      lat: INTEGRATIONS.googleMaps.defaultCenter.lat,
      lng: INTEGRATIONS.googleMaps.defaultCenter.lng,
      formattedAddress: address,
    };
  }

  async calculateDistance(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }): Promise<{ distanceMeters: number; durationSeconds: number }> {
    const dx = origin.lat - dest.lat;
    const dy = origin.lng - dest.lng;
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy) * 111000);
    return { distanceMeters: dist, durationSeconds: Math.round(dist / 10) };
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (INTEGRATIONS.posthog.enabled) {
      console.log(`[IntegrationGateway:Analytics (PostHog)] Track: ${eventName}`, properties);
    }
  }

  identifyUser(userId: string, traits?: Record<string, any>): void {
    if (INTEGRATIONS.posthog.enabled) {
      console.log(`[IntegrationGateway:Analytics (PostHog)] Identify: ${userId}`, traits);
    }
  }

  captureException(error: Error | unknown, context?: Record<string, any>): void {
    if (INTEGRATIONS.sentry.enabled) {
      console.error(`[IntegrationGateway:Monitoring (Sentry)] Exception captured:`, error, context);
    } else {
      console.error(`[IntegrationGateway:Monitoring Simulation] Exception:`, error);
    }
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
    console.log(`[IntegrationGateway:Monitoring (Sentry)] [${level.toUpperCase()}] ${message}`);
  }

  async indexDocument(indexName: string, doc: Record<string, any>): Promise<void> {
    console.log(`[IntegrationGateway:Search (Algolia/Postgres)] Indexing into ${indexName}:`, doc.id || doc);
  }

  async search(indexName: string, query: string): Promise<any[]> {
    console.log(`[IntegrationGateway:Search (Algolia/Postgres)] Querying ${indexName} for "${query}"`);
    return [];
  }

  async sendPushNotification(token: string, title: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[IntegrationGateway:Push (Firebase FCM)] Dispatching push to token ${token.substring(0, 10)}... [Title: ${title}]`);
    return { success: true, messageId: `fcm_${Date.now()}` };
  }

  async sendTopicPushNotification(topic: string, title: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[IntegrationGateway:Push (Firebase FCM)] Dispatching topic push to /topics/${topic} [Title: ${title}]`);
    return { success: true, messageId: `fcm_topic_${Date.now()}` };
  }

  startRecording(userId?: string, metadata?: Record<string, any>): void {
    console.log(`[IntegrationGateway:SessionReplay (Microsoft Clarity)] Recording started for user ${userId || "anonymous"}`, metadata);
  }

  tagSession(key: string, value: string): void {
    console.log(`[IntegrationGateway:SessionReplay (Microsoft Clarity)] Tagged session: [${key} = ${value}]`);
  }

  getDeploymentMetadata(): { environment: "production" | "preview" | "development"; commitRef: string; region: string } {
    return {
      environment: import.meta.env.PROD ? "production" : "development",
      commitRef: import.meta.env.VITE_COMMIT_REF || "local_dev",
      region: "sfo1 (Cloudflare/Vercel)",
    };
  }

  async purgeCDNCache(urls?: string[]): Promise<boolean> {
    console.log(`[IntegrationGateway:CDN (Cloudflare/Vercel)] Purged cache for ${urls?.length || "all"} paths`);
    return true;
  }
}

// --- Gateway Service Registry ---

class IntegrationGatewayService {
  private defaultAdapter = new DefaultMockIntegrationAdapter();

  private smsProvider: SMSNotificationProvider = this.defaultAdapter;
  private emailProvider: EmailNotificationProvider = this.defaultAdapter;
  private paymentProvider: PaymentGatewayProvider = this.defaultAdapter;
  private walletProvider: WalletPassProvider = this.defaultAdapter;
  private storageProvider: StorageProvider = this.defaultAdapter;
  private mapsProvider: MapsProvider = this.defaultAdapter;
  private analyticsProvider: AnalyticsProvider = this.defaultAdapter;
  private monitoringProvider: MonitoringProvider = this.defaultAdapter;
  private searchProvider: SearchProvider = this.defaultAdapter;
  private pushProvider: PushNotificationProvider = this.defaultAdapter;
  private sessionReplayProvider: SessionReplayProvider = this.defaultAdapter;
  private deploymentProvider: DeploymentProvider = this.defaultAdapter;

  registerSMSProvider(provider: SMSNotificationProvider) { this.smsProvider = provider; }
  registerEmailProvider(provider: EmailNotificationProvider) { this.emailProvider = provider; }
  registerPaymentProvider(provider: PaymentGatewayProvider) { this.paymentProvider = provider; }
  registerWalletProvider(provider: WalletPassProvider) { this.walletProvider = provider; }
  registerStorageProvider(provider: StorageProvider) { this.storageProvider = provider; }
  registerMapsProvider(provider: MapsProvider) { this.mapsProvider = provider; }
  registerAnalyticsProvider(provider: AnalyticsProvider) { this.analyticsProvider = provider; }
  registerMonitoringProvider(provider: MonitoringProvider) { this.monitoringProvider = provider; }
  registerSearchProvider(provider: SearchProvider) { this.searchProvider = provider; }
  registerPushProvider(provider: PushNotificationProvider) { this.pushProvider = provider; }
  registerSessionReplayProvider(provider: SessionReplayProvider) { this.sessionReplayProvider = provider; }
  registerDeploymentProvider(provider: DeploymentProvider) { this.deploymentProvider = provider; }

  get sms() { return this.smsProvider; }
  get email() { return this.emailProvider; }
  get payments() { return this.paymentProvider; }
  get wallet() { return this.walletProvider; }
  get storage() { return this.storageProvider; }
  get maps() { return this.mapsProvider; }
  get analytics() { return this.analyticsProvider; }
  get monitoring() { return this.monitoringProvider; }
  get search() { return this.searchProvider; }
  get push() { return this.pushProvider; }
  get sessionReplay() { return this.sessionReplayProvider; }
  get deployment() { return this.deploymentProvider; }
}

export const IntegrationGateway = new IntegrationGatewayService();
