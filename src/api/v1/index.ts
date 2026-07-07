/**
 * ForeverVow — API v1 Contract Layer
 * Typed REST-style API endpoints and standardized response envelopes.
 */

import { WeddingService } from "@/services/WeddingService";
import { RSVPRepository } from "@/repositories";
import { RSVPPayload } from "@/utils/supabase";

export interface APIv1Response<T = any> {
  apiVersion: "1.0";
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export class APIv1 {
  /**
   * Standardized success envelope builder.
   */
  static success<T>(data: T): APIv1Response<T> {
    return {
      apiVersion: "1.0",
      timestamp: new Date().toISOString(),
      data,
    };
  }

  /**
   * Standardized error envelope builder.
   */
  static error(code: string, message: string): APIv1Response<null> {
    return {
      apiVersion: "1.0",
      timestamp: new Date().toISOString(),
      error: { code, message },
    };
  }

  // --- Endpoints ---

  /**
   * GET /api/v1/celebration/:slug
   */
  static async getCelebration(slug: string): Promise<APIv1Response> {
    try {
      const payload = await WeddingService.getPublicWeddingPayload(slug);
      if (!payload || !payload.wedding) {
        return this.error("NOT_FOUND", `Celebration with slug '${slug}' not found.`);
      }
      return this.success(payload);
    } catch (err: any) {
      return this.error("INTERNAL_ERROR", err?.message || "Failed to fetch celebration data.");
    }
  }

  /**
   * POST /api/v1/rsvp
   */
  static async submitRSVP(payload: RSVPPayload): Promise<APIv1Response> {
    try {
      if (!payload.wedding_id || !payload.guest_name) {
        return this.error("VALIDATION_ERROR", "wedding_id and guest_name are required.");
      }

      const rsvpRepo = new RSVPRepository();
      const res = await rsvpRepo.create(payload as any);

      if (!res.data) {
        return this.error("PERSISTENCE_ERROR", res.error || "Failed to save RSVP.");
      }

      return this.success({ id: res.data.id, status: "SUBMITTED" });
    } catch (err: any) {
      return this.error("INTERNAL_ERROR", err?.message || "RSVP submission failed.");
    }
  }

  /**
   * GET /api/v1/health
   */
  static getHealthStatus(): APIv1Response<{ status: "OK" | "DEGRADED"; uptimeSeconds: number }> {
    return this.success({
      status: "OK",
      uptimeSeconds: Math.round(performance.now() / 1000),
    });
  }
}
