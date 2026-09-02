import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { wedding_id, access_code, updates } = await req.json();

    if (!wedding_id || !access_code || !updates) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify access code
    const { data: wedding } = await supabase
      .from("weddings")
      .select("id, access_code")
      .eq("id", wedding_id)
      .single();

    if (!wedding || wedding.access_code !== access_code) {
      return new Response(JSON.stringify({ error: "Invalid access code" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only allow safe fields to be updated by couples
    const allowedFields = [
      "wedding_date",
      "ceremony_venue",
      "reception_venue",
      "ceremony_time",
      "reception_time",
      "dress_code",
      "story",
      "contact_email",
    ];

    const safeUpdates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        const val = updates[key];
        // Enforce string length limits
        if (typeof val === "string" && val.length > 2000) {
          return new Response(JSON.stringify({ error: `Field ${key} is too long` }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        safeUpdates[key] = val === "" ? null : val;
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("weddings")
      .update(safeUpdates)
      .eq("id", wedding_id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
