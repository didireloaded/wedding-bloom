/**
 * ForeverVow — Invitation Domain Service
 * Manages wedding invitations, access links, token generation, open tracking, and RSVP dispatching.
 */

import { InvitationLinkRepository, GuestRepository, WeddingRepository } from "@/repositories";
import { IntegrationGateway } from "./integrations/IntegrationGateway";
import { DomainEventBus } from "./events/DomainEventBus";
import { AuditService } from "./AuditService";
import type { InvitationLink } from "@/types/wedding";

export class InvitationDomainService {
  private linkRepo = new InvitationLinkRepository();
  private guestRepo = new GuestRepository();
  private weddingRepo = new WeddingRepository();

  /**
   * Generates a unique, trackable invitation link for a guest or general sharing.
   */
  async generateInvitationLink(
    weddingId: string,
    slug: string,
    guestId?: string,
    label = "General Invitation"
  ): Promise<{ data: InvitationLink | null; error: string | null }> {
    try {
      const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://forevervow.app";
      const url = guestId ? `${baseUrl}/wedding/${slug}?invite=${token}&g=${guestId}` : `${baseUrl}/wedding/${slug}?invite=${token}`;

      const res = await this.linkRepo.create({
        wedding_id: weddingId,
        label,
        url,
        token,
        clicks: 0,
        created_at: new Date().toISOString(),
      });

      if (res.data) {
        await AuditService.log({
          who: "System",
          what: "CREATE",
          where: "InvitationService:generate",
          entityType: "wedding",
          entityId: weddingId,
          after: res.data as any,
        });
      }

      return res;
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to generate invitation link" };
    }
  }

  /**
   * Validates an invitation token and records open telemetry.
   */
  async validateInvitationToken(token: string): Promise<{ valid: boolean; link?: InvitationLink; error?: string }> {
    try {
      const { data: link, error } = await this.linkRepo.findByToken(token);
      if (error || !link) {
        return { valid: false, error: "Invalid or expired invitation token" };
      }

      // Record open click
      await this.linkRepo.incrementClicks(link.id);

      // Emit domain event
      await DomainEventBus.publish("GuestInvited", link.wedding_id, `Invitation link opened: ${link.label}`, {
        link_id: link.id,
        token,
      });

      return { valid: true, link };
    } catch (err: any) {
      return { valid: false, error: err?.message || "Token validation error" };
    }
  }

  /**
   * Dispatches a formal invitation email to a guest via Resend / Integration Gateway.
   */
  async dispatchInvitationEmail(
    weddingId: string,
    guestEmail: string,
    guestName: string,
    inviteUrl: string,
    customMessage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: wedding } = await this.weddingRepo.findById(weddingId);
      const coupleNames = wedding?.couple_names || "Eternal & Beloved";

      const htmlBody = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0e100f; color: #fffce1; padding: 40px; text-align: center; border-radius: 12px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; color: #fffce1;">You're Invited!</h1>
          <p style="font-size: 18px; color: #fffce1; opacity: 0.9; margin-bottom: 24px;">
            ${coupleNames} joyfully invite you to celebrate their wedding day.
          </p>
          ${customMessage ? `<p style="font-size: 16px; font-style: italic; margin-bottom: 24px; color: #fffce1;">"${customMessage}"</p>` : ""}
          <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #fffce1; color: #0e100f; font-weight: bold; text-decoration: none; border-radius: 50px; font-size: 16px; margin-bottom: 30px;">
            View Celebration &amp; RSVP
          </a>
          <p style="font-size: 12px; color: #fffce1; opacity: 0.5;">
            ForeverVow — Luxury Celebration Operating System
          </p>
        </div>
      `;

      const res = await IntegrationGateway.email.sendEmail({
        to: guestEmail,
        subject: `You're Invited: Wedding Celebration of ${coupleNames}`,
        html: htmlBody,
      });

      if (!res.success) {
        return { success: false, error: res.error || "Email delivery failed" };
      }

      await DomainEventBus.publish("GuestInvited", weddingId, `Invitation email sent to ${guestName} (${guestEmail})`, {
        email: guestEmail,
        url: inviteUrl,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to dispatch invitation email" };
    }
  }
}

export const InvitationService = new InvitationDomainService();
