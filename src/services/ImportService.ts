import { supabase } from "@/lib/supabase";
import { DomainEventBus } from "./events/DomainEventBus";

export interface CSVImportRow {
  name: string;
  email?: string;
  phone?: string;
  group?: string;
}

export interface ImportResult {
  success: boolean;
  insertedCount: number;
  error?: string;
}

class ImportDomainService {
  parseAndValidateCSV(rawCsv: string): { valid: CSVImportRow[]; invalid: number } {
    const lines = rawCsv.split("\n").map(l => l.trim()).filter(Boolean);
    const valid: CSVImportRow[] = [];
    let invalid = 0;

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes("name")) return; // skip header
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols[0]) {
        valid.push({
          name: cols[0],
          email: cols[1] || undefined,
          phone: cols[2] || undefined,
          group: cols[3] || "General"
        });
      } else {
        invalid++;
      }
    });

    return { valid, invalid };
  }

  async executeBatchImport(weddingId: string, rows: CSVImportRow[]): Promise<ImportResult> {
    try {
      const records = rows.map(r => ({
        wedding_id: weddingId,
        name: r.name,
        email: r.email || null,
        phone: r.phone || null,
        group_name: r.group || "General",
        status: "invited",
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from("guests").insert(records);
      if (error) return { success: false, insertedCount: 0, error: error.message };

      await DomainEventBus.publish("GuestInvited", weddingId, `Batch imported ${rows.length} guests into CRM pipeline`, { count: rows.length });
      return { success: true, insertedCount: rows.length };
    } catch (err: any) {
      return { success: false, insertedCount: 0, error: err?.message || "Import transaction failed" };
    }
  }
}

export const ImportService = new ImportDomainService();
