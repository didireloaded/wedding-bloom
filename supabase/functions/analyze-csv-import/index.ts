import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { csv_content } = await req.json();

    if (!csv_content) {
      return new Response(JSON.stringify({ error: "csv_content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse CSV lines into normalized guest objects
    const lines = csv_content.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const guests = [];

    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c: string) => c.trim().replace(/^"|"$/g, ""));
      if (i === 0 && (cols[0].toLowerCase().includes("name") || cols[0].toLowerCase().includes("guest"))) continue;
      
      if (cols[0]) {
        guests.push({
          guest_name: cols[0],
          email: cols[1] || null,
          phone: cols[2] || null,
          guest_count: Number(cols[3]) || 1,
          dietary_preference: cols[4] || null,
          attending: cols[5]?.toLowerCase() === "yes" || cols[5]?.toLowerCase() === "confirmed" ? "confirmed" : "pending"
        });
      }
    }

    return new Response(JSON.stringify({ success: true, guests }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
