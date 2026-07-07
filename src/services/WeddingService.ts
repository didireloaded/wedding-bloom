import {
  WeddingRepository,
  EventRepository,
  GalleryRepository,
  UpdateRepository,
  AccommodationRepository,
  TaskRepository,
  BudgetRepository,
  QRCodeRepository,
  InvitationLinkRepository,
  CoupleRepository,
  MoodRepository,
  RunSheetRepository
} from "@/repositories";
import {
  Wedding,
  WeddingEvent,
  GalleryItem,
  WeddingUpdate,
  Accommodation,
  TaskItem,
  BudgetItem,
  QRCodeItem,
  InvitationLink,
  MoodItem,
  RunSheetItem
} from "@/types/wedding";
import { DomainEventBus } from "./events/DomainEventBus";
import { weddingProfileSchema } from "@/validators";
import { CacheService } from "./CacheService";
import { AuditService } from "./AuditService";

class WeddingDomainService extends WeddingRepository {
  private eventRepo = new EventRepository();
  private galleryRepo = new GalleryRepository();
  private updateRepo = new UpdateRepository();
  private accommodationRepo = new AccommodationRepository();
  private taskRepo = new TaskRepository();
  private budgetRepo = new BudgetRepository();
  private qrCodeRepo = new QRCodeRepository();
  private invitationLinkRepo = new InvitationLinkRepository();
  private coupleRepo = new CoupleRepository();
  private moodRepo = new MoodRepository();
  private runSheetRepo = new RunSheetRepository();

  constructor() {
    super();
  }

  async getPublicWeddingPayload(slug: string): Promise<{
    wedding: Wedding | null;
    events: WeddingEvent[];
    gallery: GalleryItem[];
    updates: WeddingUpdate[];
    accommodations: Accommodation[];
  }> {
    const cacheKey = `wedding:payload:${slug}`;
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const { data: wData } = await this.findBySlug(slug);
    if (!wData) {
      return { wedding: null, events: [], gallery: [], updates: [], accommodations: [] };
    }

    const [events, galleryRes, updates, accommodationsRes] = await Promise.all([
      this.eventRepo.findByWeddingIdOrdered(wData.id),
      this.galleryRepo.findByWeddingId(wData.id),
      this.updateRepo.findByWeddingIdOrdered(wData.id),
      this.accommodationRepo.findByWeddingId(wData.id),
    ]);

    const result = {
      wedding: wData,
      events,
      gallery: galleryRes.data || [],
      updates,
      accommodations: accommodationsRes.data || [],
    };

    CacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 min TTL
    return result;
  }

  async createWedding(payload: Partial<Wedding>): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      if (payload.couple_names || payload.slug || payload.access_code) {
        weddingProfileSchema.partial().parse(payload);
      }
    } catch (err: any) {
      return { data: null, error: err?.issues?.[0]?.message || err?.errors?.[0]?.message || err.message || "Validation failed" };
    }

    const res = await this.create(payload);
    if (res.data) {
      CacheService.invalidatePattern("wedding:*");
      await AuditService.log({
        who: payload.couple_names || "System",
        what: "CREATE",
        where: "WeddingService",
        entityType: "wedding",
        entityId: res.data.id,
        after: res.data as any,
      });
      await DomainEventBus.publish("WeddingCreated", res.data.id, `Wedding created for ${res.data.couple_names}`, {
        slug: res.data.slug
      });
    }
    return res;
  }

  async publishWedding(id: string): Promise<{ data: Wedding | null; error: string | null }> {
    const res = await this.update(id, { published: true });
    if (res.data) {
      CacheService.invalidatePattern("wedding:*");
      await AuditService.log({
        who: res.data.couple_names || "System",
        what: "PUBLISH",
        where: "WeddingService",
        entityType: "wedding",
        entityId: id,
        after: { published: true },
      });
      await DomainEventBus.publish("WeddingPublished", res.data.id, `Invitation portal published live for ${res.data.couple_names}`, {
        slug: res.data.slug
      });
    }
    return res;
  }

  getPublicInvitationUrl(slug: string): string {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/wedding/${slug}`;
  }

  getQrRedirectUrl(slug: string): string {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/qr/${slug}`;
  }

  // ── SPRINT 5: AUTOMATED GENERATION WORKFLOWS ──

  async generateUniqueSlug(coupleNames: string, date?: string): Promise<string> {
    const base = coupleNames
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    const yearSuffix = date ? `-${new Date(date).getFullYear() || new Date().getFullYear()}` : "";
    const candidate = (base || "celebration") + yearSuffix;

    const { data } = await this.findBySlug(candidate);
    if (!data) return candidate;

    return `${candidate}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  generateAccessCode(coupleNames?: string): string {
    const prefix = coupleNames ? coupleNames.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() : "VOWS";
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix.padEnd(4, "X")}${random}`;
  }

  async generateQRCodesForWedding(weddingId: string, slug: string): Promise<QRCodeItem[]> {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://forevervow.app";
    const qrPayloads: Omit<QRCodeItem, "id" | "created_at">[] = [
      {
        wedding_id: weddingId,
        label: "Main Invitation",
        target_url: `${origin}/wedding/${slug}`,
        code_data: `${origin}/wedding/${slug}`,
        scan_count: 0,
        is_active: true,
      },
      {
        wedding_id: weddingId,
        label: "Table Check-in",
        target_url: `${origin}/checkin/${slug}`,
        code_data: `${origin}/checkin/${slug}`,
        scan_count: 0,
        is_active: true,
      },
      {
        wedding_id: weddingId,
        label: "Photo Vault",
        target_url: `${origin}/wedding/${slug}?tab=gallery`,
        code_data: `${origin}/wedding/${slug}?tab=gallery`,
        scan_count: 0,
        is_active: true,
      },
    ];

    const results = await Promise.all(
      qrPayloads.map(payload => this.qrCodeRepo.create(payload as any))
    );

    return results.map(r => r.data).filter(Boolean) as QRCodeItem[];
  }

  async createInvitationLink(weddingId: string, guestId?: string, customUrl?: string): Promise<{ data: InvitationLink | null; error: string | null }> {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://forevervow.app";
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const url = customUrl || `${origin}/wedding/invite/${token}`;

    return await this.invitationLinkRepo.create({
      wedding_id: weddingId,
      guest_id: guestId || null,
      unique_token: token,
      url,
      open_count: 0,
    } as any);
  }

  // ── SPRINT 5: LIFECYCLE MANAGEMENT & PRE-POPULATION ENGINE ──

  async createWeddingWithDefaults(
    payload: Partial<Wedding>,
    templateName?: string,
    coupleEmail?: string,
    couplePhone?: string
  ): Promise<{ data: Wedding | null; error: string | null }> {
    try {
      if (payload.couple_names || payload.slug || payload.access_code) {
        weddingProfileSchema.partial().parse(payload);
      }
    } catch (err: any) {
      return { data: null, error: err?.issues?.[0]?.message || err?.errors?.[0]?.message || err.message || "Validation failed" };
    }

    const coupleNames = payload.couple_names || "Eternal & Beloved";
    const slug = payload.slug || await this.generateUniqueSlug(coupleNames, payload.wedding_date || undefined);
    const accessCode = payload.access_code || this.generateAccessCode(coupleNames);

    const weddingPayload: Partial<Wedding> = {
      ...payload,
      couple_names: coupleNames,
      slug,
      access_code: accessCode,
      published: payload.published ?? false,
      legacy_mode: payload.legacy_mode ?? false,
      story: payload.story || "Welcome to our forever celebration. We are overjoyed to share our special day with our cherished family and friends.",
      dress_code: payload.dress_code || "Formal / Black Tie Optional",
      hashtag: payload.hashtag || coupleNames.replace(/[^a-zA-Z]/g, ""),
      theme: payload.theme || { background: "38 35% 97%", foreground: "30 20% 15%", primary: "30 55% 42%", accent: "30 55% 52%", template: templateName || "editorial" },
    };

    const res = await this.create(weddingPayload);
    if (!res.data) {
      return { data: null, error: res.error || "Failed to create celebration" };
    }

    const wedding = res.data;

    // 1. Create Couple Profile
    const names = coupleNames.split(" & ");
    await this.coupleRepo.create({
      wedding_id: wedding.id,
      partner_a_name: names[0] || "Partner A",
      partner_b_name: names[1] || "Partner B",
      email: coupleEmail || null,
      phone: couplePhone || null,
    } as any);

    // 2. Pre-populate Default Timeline Events
    const defaultEvents: Omit<WeddingEvent, "id">[] = [
      { wedding_id: wedding.id, title: "Welcome Drinks & Gather", description: "Arrive, mingle, and enjoy refreshing signature cocktails before the ceremony begins.", location: wedding.ceremony_venue || "Main Garden", event_date: wedding.wedding_date || new Date().toISOString().split("T")[0], event_time: "15:00", sort_order: 1 },
      { wedding_id: wedding.id, title: "The Ceremony", description: "The exchange of vows and rings under the floral archways.", location: wedding.ceremony_venue || "Ceremony Lawn", event_date: wedding.wedding_date || new Date().toISOString().split("T")[0], event_time: "16:00", sort_order: 2 },
      { wedding_id: wedding.id, title: "Cocktail Hour & Canapés", description: "Enjoy champagne, acoustic music, and exquisite canapés while the couple takes portraits.", location: "Terrace & Courtyard", event_date: wedding.wedding_date || new Date().toISOString().split("T")[0], event_time: "17:30", sort_order: 3 },
      { wedding_id: wedding.id, title: "Reception Dinner & Toasts", description: "A multi-course culinary experience celebrating love, accompanied by heartfelt toasts.", location: wedding.reception_venue || "Grand Ballroom", event_date: wedding.wedding_date || new Date().toISOString().split("T")[0], event_time: "19:00", sort_order: 4 },
      { wedding_id: wedding.id, title: "First Dance & Celebration Party", description: "The dance floor opens! Join us for live music, cocktails, and late-night revelry.", location: "Ballroom Dance Floor", event_date: wedding.wedding_date || new Date().toISOString().split("T")[0], event_time: "21:00", sort_order: 5 },
    ];
    await Promise.all(defaultEvents.map(ev => this.eventRepo.create(ev as any)));

    // 3. Pre-populate Default Task Checklist
    const defaultTasks: Omit<TaskItem, "id">[] = [
      { wedding_id: wedding.id, title: "Book Wedding Venue & Secure Date", category: "Venue", assignee: "Both", due_date: null, status: "todo", priority: "high" },
      { wedding_id: wedding.id, title: "Send Out Save the Dates & Invitations", category: "Guests", assignee: "Both", due_date: null, status: "todo", priority: "high" },
      { wedding_id: wedding.id, title: "Finalize Menu & Dietary Requirements", category: "Catering", assignee: "Both", due_date: null, status: "todo", priority: "normal" },
      { wedding_id: wedding.id, title: "Book Photographer & Videographer", category: "Media", assignee: "Both", due_date: null, status: "todo", priority: "high" },
      { wedding_id: wedding.id, title: "Select Wedding Attire & Schedule Fittings", category: "Attire", assignee: "Both", due_date: null, status: "todo", priority: "normal" },
    ];
    await Promise.all(defaultTasks.map(tk => this.taskRepo.create(tk as any)));

    // 4. Pre-populate Default Budget Templates
    const defaultBudgets: Omit<BudgetItem, "id">[] = [
      { wedding_id: wedding.id, category: "Venue & Catering", item_name: "Grand Ballroom & Multi-Course Dinner", estimated_cost: 15000, actual_cost: 0, deposit_paid: 0, due_date: null, status: "pending" },
      { wedding_id: wedding.id, category: "Photography & Video", item_name: "Full Day Editorial Coverage", estimated_cost: 4500, actual_cost: 0, deposit_paid: 0, due_date: null, status: "pending" },
      { wedding_id: wedding.id, category: "Attire & Beauty", item_name: "Bridal Gown & Groom Suit", estimated_cost: 3500, actual_cost: 0, deposit_paid: 0, due_date: null, status: "pending" },
      { wedding_id: wedding.id, category: "Floral & Decor", item_name: "Ceremony Arch & Table Centerpieces", estimated_cost: 3000, actual_cost: 0, deposit_paid: 0, due_date: null, status: "pending" },
      { wedding_id: wedding.id, category: "Entertainment", item_name: "Live Acoustic Duo & Reception Band", estimated_cost: 2500, actual_cost: 0, deposit_paid: 0, due_date: null, status: "pending" },
    ];
    await Promise.all(defaultBudgets.map(bg => this.budgetRepo.create(bg as any)));

    // 5. Auto-generate QR Codes
    await this.generateQRCodesForWedding(wedding.id, wedding.slug);

    CacheService.invalidatePattern("wedding:*");
    await AuditService.log({
      who: coupleNames || "System",
      what: "CREATE",
      where: "WeddingService:createWithDefaults",
      entityType: "wedding",
      entityId: wedding.id,
      after: wedding as any,
    });

    await DomainEventBus.publish("WeddingCreated", wedding.id, `Celebration provisioned for ${wedding.couple_names}`, {
      slug: wedding.slug,
      access_code: wedding.access_code,
    });

    return { data: wedding, error: null };
  }

  async duplicateWedding(sourceWeddingId: string, newCoupleNames?: string, newSlug?: string): Promise<{ data: Wedding | null; error: string | null }> {
    const { data: source } = await this.findById(sourceWeddingId);
    if (!source) return { data: null, error: "Source celebration not found" };

    const coupleNames = newCoupleNames || `${source.couple_names} Copy`;
    const slug = newSlug || await this.generateUniqueSlug(coupleNames);
    const accessCode = this.generateAccessCode(coupleNames);

    const copyPayload: Partial<Wedding> = {
      ...source,
      id: undefined as any,
      slug,
      access_code: accessCode,
      couple_names: coupleNames,
      published: false,
      created_at: new Date().toISOString(),
    };
    delete (copyPayload as any).id;

    const res = await this.create(copyPayload);
    if (!res.data) return { data: null, error: res.error || "Failed to duplicate celebration" };

    const newWedding = res.data;

    // Clone child entities
    const [events, tasks, budgets, runSheet, accommodations, moodItems] = await Promise.all([
      this.eventRepo.findByWeddingIdOrdered(source.id),
      this.taskRepo.findByWeddingId(source.id),
      this.budgetRepo.findByWeddingId(source.id),
      this.runSheetRepo.findByWeddingId(source.id),
      this.accommodationRepo.findByWeddingId(source.id),
      this.moodRepo.findByWeddingId(source.id),
    ]);

    await Promise.all([
      ...events.map((ev: WeddingEvent) => { const { id, wedding_id, ...rest } = ev as any; return this.eventRepo.create({ ...rest, wedding_id: newWedding.id }); }),
      ...(tasks.data || []).map((tk: TaskItem) => { const { id, wedding_id, ...rest } = tk as any; return this.taskRepo.create({ ...rest, wedding_id: newWedding.id }); }),
      ...(budgets.data || []).map((bg: BudgetItem) => { const { id, wedding_id, ...rest } = bg as any; return this.budgetRepo.create({ ...rest, wedding_id: newWedding.id }); }),
      ...(runSheet.data || []).map((rs: RunSheetItem) => { const { id, wedding_id, ...rest } = rs as any; return this.runSheetRepo.create({ ...rest, wedding_id: newWedding.id }); }),
      ...(accommodations.data || []).map((ac: Accommodation) => { const { id, wedding_id, ...rest } = ac as any; return this.accommodationRepo.create({ ...rest, wedding_id: newWedding.id }); }),
      ...(moodItems.data || []).map((md: MoodItem) => { const { id, wedding_id, ...rest } = md as any; return this.moodRepo.create({ ...rest, wedding_id: newWedding.id }); }),
    ]);

    // Generate new QR Codes
    await this.generateQRCodesForWedding(newWedding.id, newWedding.slug);

    await DomainEventBus.publish("WeddingDuplicated", newWedding.id, `Celebration duplicated from ${source.couple_names} to ${newWedding.couple_names}`, {
      source_id: source.id,
      new_slug: newWedding.slug,
    });

    return { data: newWedding, error: null };
  }

  async archiveWedding(weddingId: string): Promise<{ data: Wedding | null; error: string | null }> {
    const res = await this.update(weddingId, { published: false } as any);
    if (res.data) {
      CacheService.invalidatePattern("wedding:*");
      await AuditService.log({
        who: res.data.couple_names || "System",
        what: "UPDATE",
        where: "WeddingService:archive",
        entityType: "wedding",
        entityId: weddingId,
        after: { published: false },
      });
      await DomainEventBus.publish("WeddingArchived", res.data.id, `Celebration archived for ${res.data.couple_names}`, {
        slug: res.data.slug,
      });
    }
    return res;
  }

  async deleteWedding(weddingId: string): Promise<{ success: boolean; error: string | null }> {
    const { data: w } = await this.findById(weddingId);
    const res = await this.delete(weddingId);
    if (res.error) return { success: false, error: res.error };

    CacheService.invalidatePattern("wedding:*");
    if (w) {
      await AuditService.log({
        who: w.couple_names || "System",
        what: "DELETE",
        where: "WeddingService",
        entityType: "wedding",
        entityId: weddingId,
        before: w as any,
      });
      await DomainEventBus.publish("WeddingDeleted", weddingId, `Celebration deleted: ${w.couple_names}`, {
        slug: w.slug,
      });
    }
    return { success: true, error: null };
  }
}

export const WeddingService = new WeddingDomainService();
