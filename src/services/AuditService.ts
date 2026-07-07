/**
 * ForeverVow — Audit Engine
 * Rich audit logging service tracking who, what, when, where, and exact before/after state diffs.
 */

import { supabase } from "@/utils/supabase";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "BROADCAST"
  | "MODERATE";

export interface AuditEntry {
  id?: string;
  who: string;           // User ID or email performing action
  what: AuditAction;     // Type of action performed
  when: string;          // ISO timestamp
  where: string;         // UI component, route, or subsystem
  entityType: string;    // Domain model (e.g. "wedding", "guest", "photo")
  entityId: string;      // Identifier of modified entity
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export class AuditService {
  /**
   * Log an architectural audit event with before/after diff tracking.
   */
  static async log(entry: Omit<AuditEntry, "when" | "id">): Promise<void> {
    const fullEntry: AuditEntry = {
      ...entry,
      when: new Date().toISOString(),
    };

    // Log to console in dev mode or for local audit traceability
    console.log(`[AuditEngine] ${fullEntry.what} on ${fullEntry.entityType} (${fullEntry.entityId}) by ${fullEntry.who}`, {
      where: fullEntry.where,
      diff: this.computeDiff(fullEntry.before || null, fullEntry.after || null),
    });

    try {
      const { error } = await (supabase.from("audit_log") as any).insert([
        {
          who: fullEntry.who,
          what: fullEntry.what,
          when_timestamp: fullEntry.when,
          where_location: fullEntry.where,
          entity_type: fullEntry.entityType,
          entity_id: fullEntry.entityId,
          before_state: fullEntry.before || null,
          after_state: fullEntry.after || null,
          metadata: fullEntry.metadata || null,
        },
      ]);

      if (error) {
        // Suppress DB error if table not yet created in local dev, but log warning
        console.warn("[AuditEngine] Could not persist to database:", error.message);
      }
    } catch (err) {
      console.error("[AuditEngine] Unexpected persistence failure:", err);
    }
  }

  /**
   * Retrieve chronological audit history for a specific domain entity.
   */
  static async getAuditTrail(entityType: string, entityId: string): Promise<AuditEntry[]> {
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("when_timestamp", { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        who: row.who,
        what: row.what,
        when: row.when_timestamp,
        where: row.where_location,
        entityType: row.entity_type,
        entityId: row.entity_id,
        before: row.before_state,
        after: row.after_state,
        metadata: row.metadata,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Compute exact field-level differences between before and after states.
   */
  static computeDiff(
    before: Record<string, any> | null,
    after: Record<string, any> | null
  ): Record<string, { from: any; to: any }> {
    if (!before && !after) return {};
    if (!before && after) return { _entity: { from: null, to: "CREATED" } };
    if (before && !after) return { _entity: { from: "EXISTING", to: "DELETED" } };

    const diff: Record<string, { from: any; to: any }> = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of allKeys) {
      const bVal = before?.[key];
      const aVal = after?.[key];
      if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        diff[key] = { from: bVal, to: aVal };
      }
    }

    return diff;
  }
}
