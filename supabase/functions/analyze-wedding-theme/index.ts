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
    const { description = "Elegant castle wedding with warm champagne notes" } = await req.json();

    const result = {
      palette: {
        primary: "#2C2926",
        secondary: "#726C65",
        accent: "#C5A059",
        bg: "#FAF7F2"
      },
      typography: "Playfair Display & Plus Jakarta Sans",
      vibe_summary: description
    };

    return new Response(JSON.stringify({ success: true, theme: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
