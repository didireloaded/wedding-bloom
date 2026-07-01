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
    const { couple_names, wedding_date, ceremony_venue, vibe = "Romantic & Elegant", story = "" } = await req.json();

    if (!couple_names) {
      return new Response(JSON.stringify({ error: "couple_names is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate smart curated wedding website structure matching deployed backend
    const generated = {
      couple_names,
      wedding_date: wedding_date || "2026-09-19",
      ceremony_venue: ceremony_venue || "Château de Chambord, Loir-et-Cher, France",
      ceremony_time: "16:00",
      hero_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      dress_code: "Black Tie Optional — Soft neutral tones, champagne, florals & evening elegance.",
      story: story || `${couple_names} first met under a canopy of autumn leaves and immediately knew their journey was just beginning. Through years of adventure, shared laughter, and deep devotion, their bond has only grown stronger. We are overjoyed to gather our closest family and friends to celebrate the beginning of our forever.`,
      events: [
        {
          title: "Champagne Welcome & Garden Reception",
          event_time: "15:00",
          location: "West Manor Terrace & Rose Gardens",
          description: "Arrive early to enjoy sparkling champagne, artisanal canapés, and live acoustic violin harp performance before our vows."
        },
        {
          title: "The Vow Ceremony",
          event_time: "16:00",
          location: "Grand Glass Pavilion",
          description: "Please be seated by 15:45 as we exchange our vows and rings amidst lush botanical arches overlooking the estate pond."
        },
        {
          title: "Candlelight Banquet & Toast",
          event_time: "18:30",
          location: "Historic Grand Ballroom",
          description: "Indulge in a curated multi-course French culinary experience paired with sommelier-selected wines and heartfelt toasts."
        },
        {
          title: "Midnight Gala & Dancing",
          event_time: "21:30",
          location: "Ballroom & Courtyard Lounge",
          description: "Dance the night away under crystal chandeliers with live jazz trumpet ensembles followed by our signature midnight celebration dessert."
        }
      ],
      accommodations: [
        {
          name: "Relais de Chambord Grand Hotel",
          price: "From €280/night",
          distance: "On Estate Grounds (0.2 mi)",
          booking_url: "https://www.relaisdechambord.com",
          photo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
        },
        {
          name: "Château de Les Grotteaux",
          price: "From €210/night",
          distance: "Historic Boutique Manor (4 mi)",
          booking_url: "https://www.chateau-grotteaux.com",
          photo_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"
        }
      ],
      theme_config: {
        vibe,
        primaryColor: "#2C2926",
        accentColor: "#C5A059",
        bgColor: "#FAF7F2"
      }
    };

    return new Response(JSON.stringify({ success: true, data: generated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
