// Supabase integration utility for ForeverVow
// Securely inserts guest payload into Supabase REST endpoint when env vars are present

export interface RSVPPayload {
  wedding_id: string;
  guest_name: string;
  email: string | null;
  attending: string;
  guest_count: number;
  dietary_preference: string | null;
  message: string | null;
  submitted_at: string;
}

export async function submitRSVPToBackend(payload: RSVPPayload): Promise<{ success: boolean; error?: string }> {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rsvps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("Supabase insert warning:", errText);
        return { success: false, error: errText };
      }
      return { success: true };
    } catch (err: any) {
      console.error("Supabase connection error:", err);
      return { success: false, error: err?.message || "Network error" };
    }
  }

  // If Supabase env vars aren't configured yet, succeed gracefully (data is saved in local store)
  return { success: true };
}
