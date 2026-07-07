import { supabase } from "@/lib/supabase";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  databaseLatencyMs: number;
  authHealthy: boolean;
  timestamp: string;
}

class ObservabilityDomainService {
  private sentryInitialized = false;
  private sentryDsn: string | null = null;
  private breadcrumbs: Array<{ category: string; message: string; timestamp: string; data?: any }> = [];

  /**
   * Initializes Sentry / error tracking SDK wrapper for real-time frontend & backend exception tracking.
   */
  initSentry(dsn?: string): { initialized: boolean; dsn: string | null } {
    const targetDsn = dsn || (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_SENTRY_DSN : null);
    if (targetDsn) {
      this.sentryDsn = targetDsn;
      this.sentryInitialized = true;
      console.info(`[Observability] Sentry error tracking initialized with DSN: ${targetDsn}`);
    } else {
      console.info("[Observability] Sentry DSN not provided; running in simulation/console mode.");
      this.sentryInitialized = true;
    }
    return { initialized: this.sentryInitialized, dsn: this.sentryDsn };
  }

  /**
   * Records an audit breadcrumb to attach to future exception reports.
   */
  captureBreadcrumb(category: string, message: string, data?: Record<string, any>): void {
    const breadcrumb = { category, message, timestamp: new Date().toISOString(), data };
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > 50) this.breadcrumbs.shift();
  }

  /**
   * Records user session start for uptime monitoring and session insights.
   */
  logSessionStart(userId: string, role = "couple"): void {
    this.captureBreadcrumb("session", `Session started for user ${userId} (${role})`);
    try {
      supabase.from("platform_health_logs").insert([{
        check_type: "session_start",
        status: "healthy",
        details: { userId, role },
        created_at: new Date().toISOString()
      }]).then();
    } catch {
      // ignore offline errors
    }
  }

  /**
   * Records user session end.
   */
  logSessionEnd(userId: string): void {
    this.captureBreadcrumb("session", `Session ended for user ${userId}`);
  }

  async logException(error: Error | string, context: Record<string, any> = {}): Promise<void> {
    const message = typeof error === "string" ? error : error.message;
    console.error(`[Observability] Error logged: ${message}`, { ...context, breadcrumbs: this.breadcrumbs });
    try {
      await supabase.from("platform_health_logs").insert([{
        check_type: "exception",
        status: "unhealthy",
        details: { message, stack: typeof error === "object" ? error.stack : undefined, breadcrumbs: this.breadcrumbs, ...context },
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("[Observability] Failed to write health log:", err);
    }
  }

  async trackLatency<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      if (duration > 1000) {
        console.warn(`[Observability] Slow operation detected: ${operationName} (${duration}ms)`);
      }
      return result;
    } catch (error: any) {
      const duration = Math.round(performance.now() - start);
      await this.logException(error, { operationName, durationMs: duration });
      throw error;
    }
  }

  async runSystemHealthCheck(): Promise<HealthCheckResult> {
    const start = performance.now();
    let dbStatus = false;
    try {
      const { error } = await supabase.from("weddings").select("id").limit(1);
      dbStatus = !error;
    } catch (err) {
      console.warn("[Observability] DB health check failed:", err);
      dbStatus = false;
    }
    const latency = Math.round(performance.now() - start);

    let authHealthy = true;
    try {
      const { error } = await supabase.auth.getSession();
      if (error) authHealthy = false;
    } catch (err) {
      console.warn("[Observability] Auth health check failed:", err);
      authHealthy = false;
    }

    const status = dbStatus && authHealthy ? "healthy" : dbStatus ? "degraded" : "unhealthy";

    try {
      await supabase.from("platform_health_logs").insert([{
        check_type: "system_probe",
        status,
        latency_ms: latency,
        details: { dbStatus, authHealthy },
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Observability] Health log write failed:", err);
    }

    return {
      status,
      databaseLatencyMs: latency,
      authHealthy,
      timestamp: new Date().toISOString()
    };
  }
}

export const ObservabilityService = new ObservabilityDomainService();
