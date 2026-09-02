import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { wedding_id, access_code, action, moment_id } = await req.json();

    if (!wedding_id || !access_code || !action) {
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
      .select("id, access_code, live_mode")
      .eq("id", wedding_id)
      .single();

    if (!wedding || wedding.access_code !== access_code) {
      return new Response(JSON.stringify({ error: "Invalid access code" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    if (action === "list") {
      result = await supabase
        .from("wedding_moments")
        .select("*")
        .eq("wedding_id", wedding_id)
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify({ data: result.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!moment_id) {
      return new Response(JSON.stringify({ error: "moment_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve") {
      result = await supabase.from("wedding_moments")
        .update({ approved: true })
        .eq("id", moment_id).eq("wedding_id", wedding_id);
    } else if (action === "highlight") {
      const { data: current } = await supabase.from("wedding_moments")
        .select("highlighted").eq("id", moment_id).single();
      result = await supabase.from("wedding_moments")
        .update({ approved: true, highlighted: !(current?.highlighted ?? false) })
        .eq("id", moment_id).eq("wedding_id", wedding_id);
    } else if (action === "delete") {
      result = await supabase.from("wedding_moments")
        .delete().eq("id", moment_id).eq("wedding_id", wedding_id);
    } else if (action === "toggle_live_mode") {
      result = await supabase.from("weddings")
        .update({ live_mode: !wedding.live_mode }).eq("id", wedding_id);
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (result?.error) throw result.error;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
