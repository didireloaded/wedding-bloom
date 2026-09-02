export interface ColumnMapping {
  couple_names?: string;
  wedding_date?: string;
  ceremony_time?: string;
  reception_time?: string;
  venue_name?: string;
  venue_address?: string;
  story_meet?: string;
  proposal_story?: string;
  guest_message?: string;
  dress_code?: string;
  max_guests?: string;
  whatsapp_group_url?: string;
  contact_email?: string;
  reception_venue?: string;
}

export interface CleanedWedding {
  couple_names: string;
  slug: string;
  wedding_date: string | null;
  ceremony_time: string | null;
  reception_time: string | null;
  ceremony_venue: string | null;
  reception_venue: string | null;
  story: string | null;
  dress_code: string | null;
  max_guests: number | null;
  whatsapp_group_url: string | null;
  contact_email: string | null;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function generateAccessCode(): string {
  return Math.random().toString(16).substring(2, 10);
}

/**
 * Safely extract a value from a CSV row using the AI mapping.
 * Returns null if not mapped or empty — NEVER invents data.
 */
function safeGet(row: Record<string, string>, mapping: ColumnMapping, field: keyof ColumnMapping): string | null {
  const csvColumn = mapping[field];
  if (!csvColumn) return null;
  const value = row[csvColumn];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

/**
 * Build a story from available parts. Only includes what exists.
 * Returns null if no story parts are available.
 */
function buildStory(row: Record<string, string>, mapping: ColumnMapping): string | null {
  const parts: string[] = [];

  const meet = safeGet(row, mapping, "story_meet");
  if (meet) parts.push(meet);

  const proposal = safeGet(row, mapping, "proposal_story");
  if (proposal) parts.push(proposal);

  const message = safeGet(row, mapping, "guest_message");
  if (message) parts.push(message);

  return parts.length > 0 ? parts.join("\n\n") : null;
}

export function cleanWeddingRow(row: Record<string, string>, mapping: ColumnMapping): CleanedWedding | null {
  const couple = safeGet(row, mapping, "couple_names");
  if (!couple) return null; // couple names is required

  const maxGuestsStr = safeGet(row, mapping, "max_guests");
  const maxGuests = maxGuestsStr ? parseInt(maxGuestsStr, 10) : null;

  return {
    couple_names: couple,
    slug: generateSlug(couple),
    wedding_date: safeGet(row, mapping, "wedding_date"),
    ceremony_time: safeGet(row, mapping, "ceremony_time"),
    reception_time: safeGet(row, mapping, "reception_time"),
    ceremony_venue: safeGet(row, mapping, "venue_name"),
    reception_venue: safeGet(row, mapping, "reception_venue"),
    story: buildStory(row, mapping),
    dress_code: safeGet(row, mapping, "dress_code"),
    max_guests: maxGuests && !isNaN(maxGuests) ? maxGuests : null,
    whatsapp_group_url: safeGet(row, mapping, "whatsapp_group_url"),
    contact_email: safeGet(row, mapping, "contact_email"),
  };
}
