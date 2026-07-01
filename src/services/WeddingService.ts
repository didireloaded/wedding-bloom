import { BaseRepository } from "./repository/BaseRepository";
import { Wedding } from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";
import { supabase } from "@/lib/supabase";

class WeddingDomainService extends BaseRepository<Wedding> {
  constructor() {
    super("weddings");
  }

  async findBySlug(slug: string): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as Wedding, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to query wedding by slug" };
    }
  }

  async findByAccessCode(accessCode: string): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      const normalized = accessCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("access_code", normalized)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as Wedding, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to query wedding by access code" };
    }
  }

  async createWedding(payload: Partial<Wedding>): Promise<{ data: Wedding | null; error: string | null }> {
    const res = await this.create(payload);
    if (res.data) {
      await DomainEventBus.publish("WeddingCreated", res.data.id, `Wedding created for ${res.data.couple_names}`, {
        slug: res.data.slug
      });
    }
    return res;
  }

  async publishWedding(id: string): Promise<{ data: Wedding | null; error: string | null }> {
    const res = await this.update(id, { published: true });
    if (res.data) {
      await DomainEventBus.publish("WeddingPublished", res.data.id, `Invitation portal published live for ${res.data.couple_names}`, {
        slug: res.data.slug
      });
    }
    return res;
  }

  getPublicInvitationUrl(slug: string): string {
    return `${window.location.origin}/wedding/${slug}`;
  }

  getQrRedirectUrl(slug: string): string {
    return `${window.location.origin}/qr/${slug}`;
  }
}

export const WeddingService = new WeddingDomainService();
