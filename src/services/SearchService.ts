/**
 * ForeverVow — Global Search Service
 * Cross-entity full-text search across celebrations, guests, timeline events, and tasks.
 */

import { WeddingRepository, EventRepository, TaskRepository, GuestRepository } from "@/repositories";
import { IntegrationGateway } from "./integrations/IntegrationGateway";

export interface SearchResultItem {
  id: string;
  type: "wedding" | "guest" | "event" | "task";
  title: string;
  subtitle?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export class SearchService {
  private static wedRepo = new WeddingRepository();
  private static eventRepo = new EventRepository();
  private static taskRepo = new TaskRepository();
  private static guestRepo = new GuestRepository();

  /**
   * Search across all domain entities (scoped to a wedding if weddingId is provided).
   */
  static async searchAll(query: string, weddingId?: string): Promise<SearchResultItem[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    try {
      // 1. Search Celebrations (Weddings)
      if (!weddingId) {
        const { data: weddings } = await this.wedRepo.findAll();
        (weddings || []).forEach((w: any) => {
          if (
            (w.couple_names && w.couple_names.toLowerCase().includes(cleanQuery)) ||
            (w.slug && w.slug.toLowerCase().includes(cleanQuery)) ||
            (w.ceremony_venue && w.ceremony_venue.toLowerCase().includes(cleanQuery))
          ) {
            results.push({
              id: w.id,
              type: "wedding",
              title: w.couple_names || "Celebration",
              subtitle: `📍 ${w.ceremony_venue || "TBD"} • 📅 ${w.wedding_date || "TBD"}`,
              url: `/wedding/${w.slug}`,
              metadata: { slug: w.slug, published: w.published },
            });
          }
        });
      }

      // 2. Search Timeline Events & Tasks (if scoped to a wedding)
      if (weddingId) {
        const [eventsRes, tasksRes, guestsRes] = await Promise.all([
          this.eventRepo.findByWeddingIdOrdered(weddingId),
          this.taskRepo.findByWeddingId(weddingId),
          this.guestRepo.findByWeddingId(weddingId),
        ]);

        // Events
        (eventsRes || []).forEach((ev: any) => {
          if (
            (ev.title && ev.title.toLowerCase().includes(cleanQuery)) ||
            (ev.description && ev.description.toLowerCase().includes(cleanQuery)) ||
            (ev.location && ev.location.toLowerCase().includes(cleanQuery))
          ) {
            results.push({
              id: ev.id,
              type: "event",
              title: ev.title,
              subtitle: `🕒 ${ev.event_time || ""} @ ${ev.location || "Venue"}`,
              url: `/cockpit/${weddingId}?tab=timeline`,
            });
          }
        });

        // Tasks
        (tasksRes.data || []).forEach((tk: any) => {
          if (
            (tk.title && tk.title.toLowerCase().includes(cleanQuery)) ||
            (tk.category && tk.category.toLowerCase().includes(cleanQuery)) ||
            (tk.assignee && tk.assignee.toLowerCase().includes(cleanQuery))
          ) {
            results.push({
              id: tk.id,
              type: "task",
              title: tk.title,
              subtitle: `📌 Category: ${tk.category || "General"} • Status: ${tk.status || "todo"}`,
              url: `/cockpit/${weddingId}?tab=tasks`,
            });
          }
        });

        // Guests
        (guestsRes.data || []).forEach((gt: any) => {
          if (
            (gt.first_name && gt.first_name.toLowerCase().includes(cleanQuery)) ||
            (gt.last_name && gt.last_name.toLowerCase().includes(cleanQuery)) ||
            (gt.email && gt.email.toLowerCase().includes(cleanQuery))
          ) {
            results.push({
              id: gt.id,
              type: "guest",
              title: `${gt.first_name || ""} ${gt.last_name || ""}`.trim() || "Guest",
              subtitle: `✉️ ${gt.email || "No email"} • RSVP: ${gt.rsvp_status || "pending"}`,
              url: `/cockpit/${weddingId}?tab=guests`,
            });
          }
        });
      }

      // 3. Log search query to integration gateway
      void IntegrationGateway.search.search("forevervow_universal", cleanQuery);

      return results;
    } catch (err) {
      console.error("[SearchService] Search execution error:", err);
      return [];
    }
  }
}
