import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { columns, type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt: string;

    if (type === "format_story") {
      // Story formatting — AI may only rewrite, never invent
      prompt = `You are a wedding website copywriter. Rewrite the following wedding story for a beautiful website presentation.

CRITICAL RULES:
- Do NOT invent any new details, venues, dates, times, or facts.
- Use ONLY the information provided below.
- If details are missing, do NOT guess or fill in blanks.
- Simply polish the language, fix grammar, and make it elegant.
- Return ONLY the formatted text, no explanations.

Story input:
${data}`;
    } else {
      // Column mapping — AI maps CSV headers to system fields
      prompt = `You are analyzing CSV column headers from a wedding form submission.

Your task: Map each CSV column name to the correct wedding system field.

CRITICAL RULES:
- Never invent information.
- If a column does not clearly match a field, do NOT map it.
- Only return confident mappings.
- Return a valid JSON object.

Target system fields:
- couple_names (the names of the couple, e.g. "John & Anna")
- wedding_date (date of the wedding)
- ceremony_time (ceremony start time)
- reception_time (reception start time)
- venue_name (name of ceremony venue)
- venue_address (address of the venue)
- story_meet (how the couple met)
- proposal_story (how the proposal happened)
- guest_message (message to guests from the couple)
- dress_code (dress code description)
- max_guests (maximum guest capacity)
- whatsapp_group_url (WhatsApp group link)
- contact_email (couple's contact email)
- reception_venue (reception venue if different from ceremony)

CSV column headers:
${JSON.stringify(columns)}

Return ONLY a JSON object mapping system field names to the matching CSV column header string. Example:
{"couple_names": "Couple Names", "wedding_date": "Wedding Date", "venue_name": "Venue Name"}

If a field has no match, omit it from the output.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (type === "format_story") {
      return new Response(JSON.stringify({ result: content.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON mapping from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "AI could not parse columns", raw: content }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mapping = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify({ mapping }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-csv-import error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
