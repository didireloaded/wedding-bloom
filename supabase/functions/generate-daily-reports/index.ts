import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all published weddings
    const { data: weddings, error: weddingsError } = await supabase
      .from("weddings")
      .select("id, couple_names")
      .eq("published", true);

    if (weddingsError) throw weddingsError;
    if (!weddings || weddings.length === 0) {
      return new Response(JSON.stringify({ message: "No published weddings" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const results: any[] = [];

    for (const wedding of weddings) {
      try {
        // Check if report already exists for today
        const { data: existing } = await supabase
          .from("wedding_reports")
          .select("id")
          .eq("wedding_id", wedding.id)
          .eq("report_date", today)
          .single();

        if (existing) {
          results.push({ wedding_id: wedding.id, status: "skipped", reason: "already exists" });
          continue;
        }

        // Fetch wedding data for context
        const [rsvpRes, guestbookRes, photosRes, checkinsRes] = await Promise.all([
          supabase.from("rsvps").select("*").eq("wedding_id", wedding.id),
          supabase.from("guestbook").select("*").eq("wedding_id", wedding.id),
          supabase.from("guest_photos").select("id").eq("wedding_id", wedding.id),
          supabase.from("checkins").select("*").eq("wedding_id", wedding.id),
        ]);

        const rsvps = rsvpRes.data || [];
        const guestbook = guestbookRes.data || [];
        const photos = photosRes.data || [];
        const checkins = checkinsRes.data || [];

        const confirmedRsvps = rsvps.filter((r: any) => r.attending === true);
        const pendingRsvps = rsvps.filter((r: any) => r.attending === null);
        const totalGuests = confirmedRsvps.reduce((s: number, r: any) => s + (r.guest_count || 1), 0);

        // Build context for AI
        const context = `
WEDDING: ${wedding.couple_names}
DATE: Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}

CURRENT STATUS:
- Total RSVPs: ${rsvps.length}
- Confirmed: ${confirmedRsvps.length} (${totalGuests} guests)
- Pending: ${pendingRsvps.length}
- Guestbook messages: ${guestbook.length}
- Photos uploaded: ${photos.length}
- Check-ins: ${checkins.length}
`;

        // Call AI to generate report
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a friendly wedding assistant generating a daily report for ${wedding.couple_names}. Create a warm, concise summary of their wedding status. Be encouraging and helpful.

${context}`,
              },
              {
                role: "user",
                content: "Generate today's wedding report.",
              },
            ],
            tools: [{
              type: "function",
              function: {
                name: "generate_daily_report",
                description: "Generate a daily wedding report",
                parameters: {
                  type: "object",
                  properties: {
                    greeting: { type: "string" },
                    summary: { type: "string" },
                    highlights: { type: "array", items: { type: "string" } },
                    actionItems: { type: "array", items: { type: "string" } },
                  },
                  required: ["greeting", "summary", "highlights", "actionItems"],
                  additionalProperties: false,
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "generate_daily_report" } },
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for wedding ${wedding.id}:`, errText);
          results.push({ wedding_id: wedding.id, status: "error", reason: "AI call failed" });
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall) {
          results.push({ wedding_id: wedding.id, status: "error", reason: "No tool call response" });
          continue;
        }

        const report = JSON.parse(toolCall.function.arguments);

        // Store the report
        const { error: insertError } = await supabase.from("wedding_reports").insert({
          wedding_id: wedding.id,
          report_date: today,
          report_text: `${report.greeting} ${report.summary}`,
          highlights: report.highlights || [],
          action_items: report.actionItems || [],
          stats: {
            total_rsvps: rsvps.length,
            confirmed: confirmedRsvps.length,
            pending: pendingRsvps.length,
            total_guests: totalGuests,
            messages: guestbook.length,
            photos: photos.length,
          },
        });

        if (insertError) {
          console.error(`Insert error for wedding ${wedding.id}:`, insertError);
          results.push({ wedding_id: wedding.id, status: "error", reason: insertError.message });
        } else {
          results.push({ wedding_id: wedding.id, status: "success" });
        }

      } catch (e) {
        console.error(`Error processing wedding ${wedding.id}:`, e);
        results.push({ wedding_id: wedding.id, status: "error", reason: e instanceof Error ? e.message : "Unknown" });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-daily-reports error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
