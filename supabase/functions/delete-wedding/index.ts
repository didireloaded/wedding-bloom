import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { wedding_id } = await req.json();
    if (!wedding_id) {
      return new Response(JSON.stringify({ error: "wedding_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean up storage files for this wedding
    // Files are stored under `{wedding_id}/` prefix in both buckets
    const buckets = ["wedding-assets", "wedding-images"];

    for (const bucket of buckets) {
      try {
        // List all files under the wedding's folder
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(wedding_id, { limit: 1000 });

        if (files && files.length > 0) {
          // Handle nested folders (e.g., wedding_id/guest-photos/, wedding_id/gallery/)
          for (const item of files) {
            if (item.id === null) {
              // It's a folder — list and delete its contents
              const { data: subFiles } = await supabase.storage
                .from(bucket)
                .list(`${wedding_id}/${item.name}`, { limit: 1000 });

              if (subFiles && subFiles.length > 0) {
                const subPaths = subFiles.map(f => `${wedding_id}/${item.name}/${f.name}`);
                await supabase.storage.from(bucket).remove(subPaths);
              }
            }
          }

          // Delete top-level files
          const topFiles = files.filter(f => f.id !== null).map(f => `${wedding_id}/${f.name}`);
          if (topFiles.length > 0) {
            await supabase.storage.from(bucket).remove(topFiles);
          }
        }
      } catch (e) {
        // Bucket might not exist or be empty — continue
        console.log(`Storage cleanup for bucket ${bucket}: ${e}`);
      }
    }

    // Delete the wedding row — CASCADE handles all related table data
    const { error: deleteError } = await supabase
      .from("weddings")
      .delete()
      .eq("id", wedding_id);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
