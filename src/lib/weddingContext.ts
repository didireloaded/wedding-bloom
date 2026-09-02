import { supabase } from "@/integrations/supabase/client";

export interface WeddingContext {
  // Core wedding info
  coupleNames: string;
  weddingDate: string | null;
  ceremonyVenue: string | null;
  receptionVenue: string | null;
  ceremonyTime: string | null;
  receptionTime: string | null;
  dressCode: string | null;
  story: string | null;
  
  // RSVP statistics
  totalRsvps: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingRsvps: number;
  totalGuestCount: number;
  
  // Dietary breakdown
  dietarySummary: Record<string, number>;
  specialDietaryNotes: string[];
  
  // Engagement metrics
  guestbookMessages: number;
  approvedMessages: number;
  pendingMessages: number;
  photosUploaded: number;
  guestPhotos: number;
  checkins: number;
  
  // Recent activity (for AI context)
  recentRsvps: Array<{ name: string; attending: boolean | null; guestCount: number; dietary?: string }>;
  recentMessages: Array<{ name: string; message: string }>;
  
  // Timestamps
  lastUpdated: string;
}

// In-memory cache for wedding contexts
const contextCache = new Map<string, { context: WeddingContext; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Build comprehensive wedding context for AI
 */
export async function buildWeddingContext(weddingId: string): Promise<WeddingContext | null> {
  // Check cache first
  const cached = contextCache.get(weddingId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.context;
  }
  
  try {
    // Fetch all wedding data in parallel
    const [weddingRes, rsvpRes, guestbookRes, galleryRes, guestPhotosRes, checkinsRes] = await Promise.all([
      supabase.from("weddings").select("*").eq("id", weddingId).single(),
      supabase.from("rsvps").select("*").eq("wedding_id", weddingId).order("submitted_at", { ascending: false }),
      supabase.from("guestbook").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }),
      supabase.from("gallery").select("id").eq("wedding_id", weddingId),
      supabase.from("guest_photos").select("*").eq("wedding_id", weddingId),
      supabase.from("checkins").select("*").eq("wedding_id", weddingId),
    ]);
    
    if (!weddingRes.data) return null;
    
    const wedding = weddingRes.data;
    const rsvps = rsvpRes.data || [];
    const guestbook = guestbookRes.data || [];
    const gallery = galleryRes.data || [];
    const guestPhotos = guestPhotosRes.data || [];
    const checkins = checkinsRes.data || [];
    
    // Calculate RSVP statistics
    const confirmedRsvps = rsvps.filter(r => r.attending === true);
    const declinedRsvps = rsvps.filter(r => r.attending === false);
    const pendingRsvps = rsvps.filter(r => r.attending === null);
    const totalGuestCount = confirmedRsvps.reduce((sum, r) => sum + (r.guest_count || 1), 0);
    
    // Build dietary summary
    const dietarySummary: Record<string, number> = {};
    const specialDietaryNotes: string[] = [];
    
    confirmedRsvps.forEach(r => {
      const pref = r.dietary_preference || "No preference";
      dietarySummary[pref] = (dietarySummary[pref] || 0) + 1;
      if (r.dietary_note) {
        specialDietaryNotes.push(`${r.guest_name}: ${r.dietary_note}`);
      }
    });
    
    // Recent activity for AI context
    const recentRsvps = rsvps.slice(0, 10).map(r => ({
      name: r.guest_name,
      attending: r.attending,
      guestCount: r.guest_count,
      dietary: r.dietary_preference || undefined,
    }));
    
    const recentMessages = guestbook.slice(0, 5).map(m => ({
      name: m.guest_name,
      message: m.message.substring(0, 100), // Truncate for context
    }));
    
    const context: WeddingContext = {
      // Core info
      coupleNames: wedding.couple_names,
      weddingDate: wedding.wedding_date,
      ceremonyVenue: wedding.ceremony_venue,
      receptionVenue: wedding.reception_venue,
      ceremonyTime: wedding.ceremony_time,
      receptionTime: wedding.reception_time,
      dressCode: wedding.dress_code,
      story: wedding.story,
      
      // RSVP stats
      totalRsvps: rsvps.length,
      confirmedGuests: confirmedRsvps.length,
      declinedGuests: declinedRsvps.length,
      pendingRsvps: pendingRsvps.length,
      totalGuestCount,
      
      // Dietary
      dietarySummary,
      specialDietaryNotes,
      
      // Engagement
      guestbookMessages: guestbook.length,
      approvedMessages: guestbook.filter(m => m.approved).length,
      pendingMessages: guestbook.filter(m => !m.approved).length,
      photosUploaded: gallery.length,
      guestPhotos: guestPhotos.length,
      checkins: checkins.length,
      
      // Recent activity
      recentRsvps,
      recentMessages,
      
      // Timestamp
      lastUpdated: new Date().toISOString(),
    };
    
    // Cache the context
    contextCache.set(weddingId, { context, timestamp: Date.now() });
    
    return context;
    
  } catch (error) {
    console.error("Failed to build wedding context:", error);
    return null;
  }
}

/**
 * Invalidate cached context for a wedding (call after data changes)
 */
export function invalidateWeddingContext(weddingId: string): void {
  contextCache.delete(weddingId);
}

/**
 * Format wedding context into a natural language prompt for AI
 */
export function formatContextForAI(context: WeddingContext, isDashboard: boolean = false): string {
  const dietaryList = Object.entries(context.dietarySummary)
    .filter(([key]) => key !== "No preference")
    .map(([pref, count]) => `${count} ${pref.toLowerCase()}`)
    .join(", ");
    
  let prompt = `
WEDDING INFORMATION:
==================

Couple: ${context.coupleNames}
Wedding Date: ${context.weddingDate || "Not set"}
Ceremony: ${context.ceremonyVenue || "Not specified"} ${context.ceremonyTime ? `at ${context.ceremonyTime}` : ""}
Reception: ${context.receptionVenue || "Not specified"} ${context.receptionTime ? `at ${context.receptionTime}` : ""}
Dress Code: ${context.dressCode || "Not specified"}

GUEST STATUS:
- Total RSVPs received: ${context.totalRsvps}
- Confirmed attending: ${context.confirmedGuests} (${context.totalGuestCount} total guests)
- Declined: ${context.declinedGuests}
- Pending response: ${context.pendingRsvps}

DIETARY REQUIREMENTS:
${dietaryList || "No special dietary requirements noted"}
${context.specialDietaryNotes.length > 0 ? `\nSpecial notes:\n${context.specialDietaryNotes.slice(0, 5).join("\n")}` : ""}

ENGAGEMENT:
- Guestbook messages: ${context.guestbookMessages} (${context.pendingMessages} pending approval)
- Photos uploaded: ${context.photosUploaded + context.guestPhotos}
- Guests checked in at venue: ${context.checkins}
`;

  if (isDashboard && context.recentRsvps.length > 0) {
    prompt += `
RECENT RSVPS:
${context.recentRsvps.slice(0, 5).map(r => 
  `- ${r.name}: ${r.attending === true ? "Attending" : r.attending === false ? "Declined" : "Pending"} (${r.guestCount} guests)${r.dietary ? ` - ${r.dietary}` : ""}`
).join("\n")}
`;
  }

  return prompt.trim();
}

/**
 * Build a minimal context for guest-facing chat (excludes sensitive data)
 */
export function formatContextForGuests(context: WeddingContext): string {
  return `
WEDDING INFORMATION:
Couple: ${context.coupleNames}
Wedding Date: ${context.weddingDate || "Date to be announced"}
Ceremony Location: ${context.ceremonyVenue || "To be announced"}${context.ceremonyTime ? ` at ${context.ceremonyTime}` : ""}
Reception Location: ${context.receptionVenue || "To be announced"}${context.receptionTime ? ` at ${context.receptionTime}` : ""}
Dress Code: ${context.dressCode || "Not specified - contact the couple for details"}

${context.story ? `ABOUT THE COUPLE:\n${context.story.substring(0, 500)}` : ""}
`.trim();
}
