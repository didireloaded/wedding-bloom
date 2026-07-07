/**
 * ForeverVow — QR Code Domain Service
 * Manages QR code generation, scan telemetry, and default wedding portals.
 */

import { QRCodeRepository } from "@/repositories";
import { DomainEventBus } from "./events/DomainEventBus";
import { AuditService } from "./AuditService";
import type { QRCodeItem } from "@/types/wedding";

export class QRCodeDomainService {
  private qrRepo = new QRCodeRepository();

  /**
   * Generates a trackable QR code item for a wedding portal.
   */
  async generateQRCode(
    weddingId: string,
    label: string,
    targetUrl: string
  ): Promise<{ data: QRCodeItem | null; error: string | null }> {
    try {
      const res = await this.qrRepo.create({
        wedding_id: weddingId,
        label,
        target_url: targetUrl,
        scans: 0,
        created_at: new Date().toISOString(),
      });

      if (res.data) {
        await AuditService.log({
          who: "System",
          what: "CREATE",
          where: "QRCodeService:generate",
          entityType: "wedding",
          entityId: weddingId,
          after: res.data as any,
        });
      }

      return res;
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to generate QR code" };
    }
  }

  /**
   * Generates the default set of 3 essential QR codes for a newly created wedding celebration.
   */
  async generateDefaultWeddingQRCodes(weddingId: string, slug: string): Promise<QRCodeItem[]> {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://forevervow.app";
    const defaultCodes = [
      { label: "Main Invitation Portal", target: `${baseUrl}/wedding/${slug}` },
      { label: "Table Check-in & Guestbook", target: `${baseUrl}/wedding/${slug}/checkin` },
      { label: "Photo Vault Upload", target: `${baseUrl}/wedding/${slug}/photos` },
    ];

    const results: QRCodeItem[] = [];
    for (const item of defaultCodes) {
      const res = await this.generateQRCode(weddingId, item.label, item.target);
      if (res.data) results.push(res.data);
    }

    await DomainEventBus.publish("WeddingCreated", weddingId, `Generated ${results.length} default QR codes for celebration`, {
      count: results.length,
    });

    return results;
  }

  /**
   * Tracks a physical scan of a QR code and increments scan telemetry.
   */
  async trackScan(qrCodeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: qr, error } = await this.qrRepo.findById(qrCodeId);
      if (error || !qr) return { success: false, error: "QR code not found" };

      await this.qrRepo.incrementScans(qrCodeId);

      await DomainEventBus.publish("GuestInvited", qr.wedding_id, `QR Code scanned: ${qr.label}`, {
        qr_id: qrCodeId,
        label: qr.label,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Scan tracking failed" };
    }
  }

  /**
   * Retrieves all generated QR codes for a wedding celebration.
   */
  async getQRCodesForWedding(weddingId: string): Promise<QRCodeItem[]> {
    const res = await this.qrRepo.findByWeddingId(weddingId);
    return res.data || [];
  }
}

export const QRCodeService = new QRCodeDomainService();
