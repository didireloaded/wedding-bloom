import { supabase } from "@/lib/supabase";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  databaseLatencyMs: number;
  authHealthy: boolean;
  timestamp: string;
}

class ObservabilityDomainService {
  async logException(error: Error | string, context: Record<string, any> = {}): Promise<void> {
    const message = typeof error === "string" ? error : error.message;
    console.error(`[Observability] Error logged: ${message}`, context);
    try {
      await supabase.from("platform_health_logs").insert([{
        check_type: "exception",
        status: "unhealthy",
        details: { message, stack: typeof error === "object" ? error.stack : undefined, ...context },
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
    } catch {
      dbStatus = false;
    }
    const latency = Math.round(performance.now() - start);

    let authHealthy = true;
    try {
      const { error } = await supabase.auth.getSession();
      if (error) authHealthy = false;
    } catch {
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
    } catch {}

    return {
      status,
      databaseLatencyMs: latency,
      authHealthy,
      timestamp: new Date().toISOString()
    };
  }
}

export const ObservabilityService = new ObservabilityDomainService();
