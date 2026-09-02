import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { venue, dress_code, story, location, existing_themes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const themeNames = (existing_themes || []).map((t: any) => t.name).join("\n");

    const prompt = `You are analyzing wedding information to determine the best visual theme.

Existing themes:
${themeNames}

Wedding data:
Venue: ${venue || "Not provided"}
Dress code: ${dress_code || "Not provided"}
Story: ${story || "Not provided"}
Location: ${location || "Not provided"}

CRITICAL RULES:
- Prefer an existing theme if it fits well.
- Only create a new theme if none of the existing themes match strongly.
- Do NOT invent wedding details (venues, dates, guest info).
- You may ONLY interpret style and generate design themes.
- If creating a new theme, return HSL color values (e.g. "340 60% 55%").
- Return ONLY valid JSON, no explanations.

If matching an existing theme return:
{"theme":"<exact theme name>","new_theme":false,"reason":"<brief reason>"}

If generating a new theme return:
{"theme":"<new theme name>","new_theme":true,"colors":{"primary":"<hsl>","secondary":"<hsl>","accent":"<hsl>","background":"<hsl>","foreground":"<hsl>"},"font_display":"<font name>","font_body":"<font name>","reason":"<brief reason>"}`;

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "AI could not determine theme", raw: content }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-wedding-theme error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
