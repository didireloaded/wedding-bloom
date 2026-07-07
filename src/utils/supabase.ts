import { createClient } from "@supabase/supabase-js";

// ── Fail-fast: require env vars at startup ──
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "[ForeverVow] Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface RSVPPayload {
  wedding_id: string;
  guest_name: string;
  email: string | null;
  phone?: string | null;
  attending: string;
  guest_count: number;
  dietary_preference: string | null;
  song_request?: string | null;
  message: string | null;
  submitted_at: string;
}

export async function submitRSVPToBackend(payload: RSVPPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("rsvps").insert([payload]);
    if (error) {
      console.warn("Supabase RSVP insert error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("Supabase connection error:", err);
    return { success: false, error: message };
  }
}
