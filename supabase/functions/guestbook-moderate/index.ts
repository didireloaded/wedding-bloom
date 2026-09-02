import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wedding_id, access_code, action, message_id } = await req.json();

    if (!wedding_id || !access_code || !action || !message_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    if (action === "approve") {
      result = await supabase
        .from("guestbook")
        .update({ approved: true })
        .eq("id", message_id)
        .eq("wedding_id", wedding_id);
    } else if (action === "hide") {
      result = await supabase
        .from("guestbook")
        .update({ approved: false })
        .eq("id", message_id)
        .eq("wedding_id", wedding_id);
    } else if (action === "delete") {
      result = await supabase
        .from("guestbook")
        .delete()
        .eq("id", message_id)
        .eq("wedding_id", wedding_id);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
