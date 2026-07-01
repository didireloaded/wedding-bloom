import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://idrhnmjwypudnfckhpkr.supabase.co";
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qdA092c69PPWDPviCoU57w_dZDoHzjz";

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
  } catch (err: any) {
    console.error("Supabase connection error:", err);
    return { success: false, error: err?.message || "Network error" };
  }
}
