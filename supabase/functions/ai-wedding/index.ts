import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Master AI System Prompt ────────────────────────────────────────────────
// This is the shared intelligence layer injected into every task. It defines
// the AI's role, personality, and behavioural rules for the whole platform.
const BASE_SYSTEM_PROMPT = `You are the AI intelligence layer for a wedding website platform.

Your role is to help couples understand what is happening around their wedding website and assist guests with useful information.

You will receive structured wedding data including:
- couple names
- wedding date
- venue information
- RSVP responses
- guest messages
- guest check-ins
- photo uploads
- guestbook messages
- wedding timeline
- guest questions

Your job is to analyze this information and provide helpful, clear, and accurate responses.

You must always focus on helping couples and guests understand the wedding details.

Never invent information that is not present in the provided data.

If information is missing, respond politely that the information is not available.

GENERAL BEHAVIOR
- Respond clearly and concisely.
- Keep responses friendly and warm.
- Avoid technical explanations.
- When generating insights for couples, provide meaningful observations instead of repeating raw numbers.
  Example: Instead of "There are 14 vegetarian guests", say "14 guests requested vegetarian meals. You may want to confirm this with your caterer."

OUTPUT FORMAT
When possible return structured JSON responses so the system can easily process the result.
Include insights, suggestions, and structured data where appropriate.
Avoid long paragraphs when structured data is more useful.

SAFETY
Never generate offensive content.
Always keep responses appropriate for a wedding environment.
Maintain a positive and supportive tone.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { type, ...params } = await req.json();

    let messages: { role: string; content: string }[] = [];
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    switch (type) {
      // ── interpret_rsvp_message / parse_rsvp ─────────────────────────────
      // Accepts both names for flexibility (system prompt uses interpret_rsvp_message)
      case "interpret_rsvp_message":
      case "parse_rsvp":
      case "parse_natural_rsvp": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: interpret_rsvp_message
Convert a natural language RSVP message into structured data.
- If the guest is attending, set attending: true
- Count all people mentioned including the sender
- Extract name if mentioned
- Capture any sentiment or notes
Always call the parse_rsvp tool.`,
          },
          { role: "user", content: params.message },
        ];
        tools = [{
          type: "function",
          function: {
            name: "parse_rsvp",
            description: "Extract RSVP data from a natural language message",
            parameters: {
              type: "object",
              properties: {
                attending: { type: "boolean", description: "Whether the person is attending" },
                guest_count: { type: "integer", description: "Total number of guests including the person" },
                guest_name: { type: "string", description: "Name of the person if mentioned" },
                message: { type: "string", description: "Any additional message or sentiment" },
              },
              required: ["attending", "guest_count"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "parse_rsvp" } };
        break;
      }

      // ── generate_wedding_story / generate_story ──────────────────────────
      case "generate_wedding_story":
      case "generate_story": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_wedding_story
Write a warm, emotional narrative (150–250 words) about the couple's love story.
- Write in third person
- Use a romantic but natural tone suitable for a wedding website
- Draw from how they met, their first date, the proposal, and any shared experiences
- Do not invent details not provided`,
          },
          { role: "user", content: `How we met: ${params.howMet}\nFirst date: ${params.firstDate}\nProposal: ${params.proposal}\nCouple names: ${params.coupleNames || "the couple"}` },
        ];
        break;
      }

      case "generate_timeline": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_timeline
Create a clear, realistic wedding day event sequence.
Include: ceremony, cocktail hour, reception, dinner, first dance, cake cutting, photography sessions, speeches, and other typical moments.
Ensure the timeline flows naturally through the event.
Always call the generate_timeline tool.`,
          },
          { role: "user", content: `Ceremony: ${params.ceremonyTime}\nReception: ${params.receptionTime}\nDinner: ${params.dinnerTime || "not specified"}\nVenue: ${params.venue || "not specified"}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_timeline",
            description: "Generate a wedding day timeline",
            parameters: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["time", "title"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["events"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_timeline" } };
        break;
      }

      case "suggest_seating": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: suggest_seating
Suggest optimal table arrangements for confirmed wedding guests.
- Group couples together
- Keep families together
- Consider similar age groups
- Respect the table capacity
Always call the suggest_seating tool.`,
          },
          { role: "user", content: `Guests: ${JSON.stringify(params.guests)}\nTable capacity: ${params.tableCapacity || 8}\nNumber of tables: ${params.tableCount || "auto"}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "suggest_seating",
            description: "Suggest seating arrangements for wedding tables",
            parameters: {
              type: "object",
              properties: {
                tables: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      table_name: { type: "string" },
                      guests: { type: "array", items: { type: "string" } },
                    },
                    required: ["table_name", "guests"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["tables"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "suggest_seating" } };
        break;
      }

      case "chat_assistant": {
        let weddingContext: any = params.weddingData || null;
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        // Helper to build context for a single wedding
        const buildWeddingContext = async (weddingId: string) => {
          const [weddingRes, rsvpRes, guestbookRes, eventsRes, galleryRes, checkinsRes, updatesRes] = await Promise.all([
            sb.from("weddings").select("*").eq("id", weddingId).single(),
            sb.from("rsvps").select("*").eq("wedding_id", weddingId).order("submitted_at", { ascending: false }),
            sb.from("guestbook").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }),
            sb.from("events").select("*").eq("wedding_id", weddingId).order("sort_order"),
            sb.from("gallery").select("id").eq("wedding_id", weddingId),
            sb.from("checkins").select("*").eq("wedding_id", weddingId),
            sb.from("wedding_updates").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }).limit(10),
          ]);

          const wedding = weddingRes.data;
          if (!wedding) return null;

          const rsvps = rsvpRes.data || [];
          const guestbook = guestbookRes.data || [];
          const events = eventsRes.data || [];
          const gallery = galleryRes.data || [];
          const checkins = checkinsRes.data || [];
          const updates = updatesRes.data || [];

          const confirmed = rsvps.filter((r: any) => r.attending === true);
          const declined = rsvps.filter((r: any) => r.attending === false);
          const pending = rsvps.filter((r: any) => r.attending === null);
          const totalGuests = confirmed.reduce((sum: number, r: any) => sum + (r.guest_count || 1), 0);

          const dietary: Record<string, number> = {};
          confirmed.forEach((r: any) => {
            const pref = r.dietary_preference || "No preference";
            dietary[pref] = (dietary[pref] || 0) + 1;
          });

          return {
            couple_names: wedding.couple_names,
            wedding_date: wedding.wedding_date,
            ceremony_venue: wedding.ceremony_venue,
            ceremony_time: wedding.ceremony_time,
            reception_venue: wedding.reception_venue,
            reception_time: wedding.reception_time,
            dress_code: wedding.dress_code,
            story: wedding.story,
            contact_email: wedding.contact_email,
            whatsapp_group_url: wedding.whatsapp_group_url,
            rsvp_deadline: wedding.rsvp_deadline,
            published: wedding.published,
            slug: wedding.slug,
            total_rsvps: rsvps.length,
            confirmed_attending: confirmed.length,
            total_guest_count: totalGuests,
            declined: declined.length,
            pending: pending.length,
            dietary_summary: dietary,
            special_dietary_notes: confirmed.filter((r: any) => r.dietary_note).map((r: any) => `${r.guest_name}: ${r.dietary_note}`),
            guestbook_messages: guestbook.length,
            approved_messages: guestbook.filter((m: any) => m.approved).length,
            pending_messages: guestbook.filter((m: any) => !m.approved).length,
            photos_uploaded: gallery.length,
            checkins_count: checkins.length,
            events: events.map((e: any) => ({ title: e.title, time: e.event_time, location: e.location, description: e.description })),
            recent_rsvps: rsvps.slice(0, 10).map((r: any) => ({ name: r.guest_name, attending: r.attending, guest_count: r.guest_count, dietary: r.dietary_preference, message: r.message })),
            recent_messages: guestbook.slice(0, 5).map((m: any) => ({ name: m.guest_name, message: m.message })),
            recent_updates: updates.slice(0, 5).map((u: any) => ({ message: u.message, date: u.created_at })),
          };
        };

        // Admin multi-wedding mode
        if (params.isAdmin && !params.weddingId) {
          const { data: allWeddings } = await sb.from("weddings").select("id, couple_names").order("created_at", { ascending: false }).limit(20);
          
          if (allWeddings && allWeddings.length > 0) {
            const contexts = await Promise.all(allWeddings.map((w: any) => buildWeddingContext(w.id)));
            weddingContext = {
              mode: "admin_multi_wedding",
              total_weddings: allWeddings.length,
              weddings: contexts.filter(Boolean),
            };
          }
        }
        // Single wedding mode
        else if (params.weddingId && !weddingContext) {
          weddingContext = await buildWeddingContext(params.weddingId);
        }

        const isDashboard = params.isDashboard === true;
        const isAdmin = params.isAdmin === true;

        const adminMultiPrompt = isAdmin && !params.weddingId
          ? `\n- You are helping an ADMIN who manages MULTIPLE weddings. The data below contains ALL their weddings.\n- When asked about a specific wedding, identify it by the couple's names.\n- When asked general questions, provide a summary across all weddings.\n- You can compare weddings, give cross-wedding stats, and highlight which weddings need attention.`
          : "";

        messages = [
          {
            role: "system",
            content: `You are a friendly, warm wedding assistant. You help ${isAdmin ? "an admin managing wedding websites" : isDashboard ? "couples manage their wedding" : "guests find information about the wedding"}.

CRITICAL RULES:
- ALWAYS respond in natural, conversational language — NEVER return code, JSON, or technical output
- Use the wedding data below to answer questions accurately
- If information is not available, say so warmly
- Be concise but helpful
- Use a warm, celebratory tone appropriate for weddings
${isDashboard || isAdmin ? "- Provide actionable insights, not just raw numbers\n- Help understand trends and suggest next steps" : "- For guests: help them find venue details, times, dress code, and other practical info"}${adminMultiPrompt}

WEDDING DATA:
${weddingContext ? JSON.stringify(weddingContext, null, 2) : "No wedding data available."}`,
          },
          ...(params.history || []),
          { role: "user", content: params.question },
        ];
        break;
      }


      case "recommend_vendors": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: recommend_vendors
Based on the wedding details, suggest vendors by category (photographer, caterer, florist, DJ, etc).
Adapt recommendations to the location, venue type, guest count, and budget.
Always call the recommend_vendors tool.`,
          },
          { role: "user", content: `Location: ${params.location}\nVenue: ${params.venue}\nGuest count: ${params.guestCount}\nBudget range: ${params.budget || "not specified"}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "recommend_vendors",
            description: "Recommend wedding vendors based on wedding details",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      vendor_name: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["category", "vendor_name", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "recommend_vendors" } };
        break;
      }

      case "generate_theme": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_theme
Generate a cohesive, elegant wedding color theme based on the couple's chosen style.
Return HSL color values that feel refined and professional.
Always call the generate_theme tool.`,
          },
          { role: "user", content: `Wedding style: ${params.style}\nCouple names: ${params.coupleNames || "the couple"}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_theme",
            description: "Generate a wedding color theme with HSL values",
            parameters: {
              type: "object",
              properties: {
                primary: { type: "string", description: "HSL values like '340 40% 55%'" },
                secondary: { type: "string", description: "HSL values" },
                accent: { type: "string", description: "HSL values" },
                background: { type: "string", description: "HSL values for page background" },
                foreground: { type: "string", description: "HSL values for text" },
                primary_name: { type: "string", description: "Human-readable color name like 'Rose Gold'" },
                secondary_name: { type: "string", description: "Human-readable color name" },
                accent_name: { type: "string", description: "Human-readable color name" },
                font_display: { type: "string", description: "Google Font name for headings" },
                font_body: { type: "string", description: "Google Font name for body text" },
              },
              required: ["primary", "secondary", "accent", "background", "foreground", "primary_name", "secondary_name", "accent_name", "font_display", "font_body"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_theme" } };
        break;
      }

      case "generate_invitation_message": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_invitation_message
Write beautiful, warm wedding invitation messages across multiple formats.
Include a formal card message, a WhatsApp share message (with emojis), an email subject, and a full email body.
All messages must include the wedding link.
Always call the generate_invitation_messages tool.`,
          },
          { role: "user", content: `Couple names: ${params.coupleNames}\nWedding date: ${params.weddingDate}\nVenue: ${params.venue}\nWedding link: ${params.weddingLink}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_invitation_messages",
            description: "Generate wedding invitation messages for different platforms",
            parameters: {
              type: "object",
              properties: {
                formal_invitation: { type: "string", description: "A formal, elegant invitation message (2-3 sentences)" },
                whatsapp_message: { type: "string", description: "A short, warm WhatsApp share message with wedding link and emojis" },
                email_subject: { type: "string", description: "Email subject line" },
                email_body: { type: "string", description: "Full email invitation body" },
              },
              required: ["formal_invitation", "whatsapp_message", "email_subject", "email_body"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_invitation_messages" } };
        break;
      }

      case "generate_checklist": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_checklist
Generate a detailed wedding planning checklist.
Group tasks by months_before (12, 9, 6, 3, 1, 0).
Include practical tasks: venue booking, vendors, dress, invitations, catering, transport, etc.
Only include milestones still relevant based on the months remaining.
Always call the generate_checklist tool.`,
          },
          { role: "user", content: `Wedding date: ${params.weddingDate}\nMonths until wedding: ${params.monthsUntil}` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_checklist",
            description: "Generate a wedding planning checklist",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string" },
                      months_before: { type: "integer" },
                      sort_order: { type: "integer" },
                    },
                    required: ["title", "months_before"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["tasks"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_checklist" } };
        break;
      }

      // ── generate_dashboard_insights ──────────────────────────────────────
      case "generate_dashboard_insights":
      case "generate_insights": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_dashboard_insights
Analyze the provided wedding data and generate helpful, actionable insights for the couple.
Focus on:
- Guest attendance trends (e.g. when most RSVPs arrived)
- Dietary preferences (flag anything the caterer should know)
- Guest engagement (guestbook activity, photo uploads, check-ins)
- Common guest questions (suggest page improvements)
- Photo activity patterns
- Check-in patterns on the day

Return meaningful observations, not raw numbers.
Example: "14 guests requested vegetarian meals — worth confirming with your caterer."
Always call the generate_dashboard_insights tool.`,
          },
          {
            role: "user",
            content: `Wedding data:\n${JSON.stringify(params.weddingData, null, 2)}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_dashboard_insights",
            description: "Generate actionable insights and suggestions from wedding data",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string", description: "e.g. RSVPs, Dietary, Photos, Check-ins, Guestbook" },
                      message: { type: "string", description: "The insight or observation" },
                      suggestion: { type: "string", description: "Optional action the couple should take" },
                    },
                    required: ["category", "message"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["insights"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_dashboard_insights" } };
        break;
      }

      // ── analyze_rsvp_data ────────────────────────────────────────────────
      case "analyze_rsvp_data": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: analyze_rsvp_data
Analyze the RSVP list and return a structured summary.
Include confirmed, declined, and pending counts.
Summarize dietary preferences (vegetarian, vegan, gluten-free, etc).
Highlight any special notes or unusual requests.
Flag guests who have not yet responded if a guest list was provided.
Always call the analyze_rsvp_data tool.`,
          },
          {
            role: "user",
            content: `RSVPs:\n${JSON.stringify(params.rsvps, null, 2)}\nGuests:\n${JSON.stringify(params.guests || [], null, 2)}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "analyze_rsvp_data",
            description: "Analyze RSVP data and return a structured summary",
            parameters: {
              type: "object",
              properties: {
                confirmed: { type: "integer" },
                declined: { type: "integer" },
                pending: { type: "integer" },
                total_guests_attending: { type: "integer" },
                dietary_summary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      preference: { type: "string" },
                      count: { type: "integer" },
                    },
                    required: ["preference", "count"],
                    additionalProperties: false,
                  },
                },
                special_notes: { type: "array", items: { type: "string" } },
                not_responded: { type: "array", items: { type: "string" } },
              },
              required: ["confirmed", "declined", "pending", "total_guests_attending", "dietary_summary"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "analyze_rsvp_data" } };
        break;
      }

      // ── moderate_guestbook_message ───────────────────────────────────────
      case "moderate_guestbook_message":
      case "moderate_guestbook": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: moderate_guestbook_message
Review a guestbook message and determine whether it is appropriate for a wedding website.
Check for:
- Spam or promotional content
- Offensive, hateful, or inappropriate language
- Irrelevant or unrelated content

If appropriate, mark as approved.
If it contains issues, mark as needs_review and explain why.
Always call the moderate_guestbook_message tool.`,
          },
          { role: "user", content: `Guestbook message:\n"${params.message}"` },
        ];
        tools = [{
          type: "function",
          function: {
            name: "moderate_guestbook_message",
            description: "Moderate a guestbook message for appropriateness",
            parameters: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["approved", "needs_review"], description: "Moderation decision" },
                reason: { type: "string", description: "Explanation if needs_review, or a brief confirmation if approved" },
                flags: {
                  type: "array",
                  items: { type: "string", enum: ["spam", "offensive_language", "irrelevant", "inappropriate"] },
                  description: "Any flags raised against the message",
                },
              },
              required: ["status", "reason"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "moderate_guestbook_message" } };
        break;
      }

      // ── generate_highlight_video_plan ────────────────────────────────────
      case "generate_highlight_video_plan": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_highlight_video_plan
Create a structured plan for a short wedding highlight video using the provided photos and wedding context.
Organise photos into narrative segments:
- Ceremony moments
- Couple portraits
- Family interactions
- Celebration moments

Select the most meaningful photos for each segment.
Suggest a short title and mood/tone for each segment.
Always call the generate_highlight_video_plan tool.`,
          },
          {
            role: "user",
            content: `Photos:\n${JSON.stringify(params.photos, null, 2)}\nCouple names: ${params.coupleNames || "the couple"}\nWedding date: ${params.weddingDate || "not specified"}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_highlight_video_plan",
            description: "Generate a wedding highlight video plan from photo data",
            parameters: {
              type: "object",
              properties: {
                segments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Segment title e.g. 'The Ceremony'" },
                      mood: { type: "string", description: "Tone/mood e.g. 'emotional, tender'" },
                      photo_ids: { type: "array", items: { type: "string" }, description: "IDs or URLs of photos in this segment" },
                      duration_seconds: { type: "integer", description: "Suggested duration for this segment" },
                    },
                    required: ["title", "mood", "photo_ids"],
                    additionalProperties: false,
                  },
                },
                suggested_music_mood: { type: "string", description: "Overall music mood suggestion e.g. 'romantic and uplifting'" },
                total_duration_seconds: { type: "integer" },
              },
              required: ["segments"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_highlight_video_plan" } };
        break;
      }

      // ── generate_suggestions ─────────────────────────────────────────────
      case "generate_suggestions": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: generate_suggestions
Analyze the wedding data and generate actionable suggestions to improve the wedding website and planning.
Focus on things the couple can do next: reminders, missing information, engagement ideas.
Always call the generate_suggestions tool.`,
          },
          {
            role: "user",
            content: `Wedding data:\n${JSON.stringify(params.weddingData || params.weddingId, null, 2)}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_suggestions",
            description: "Generate actionable wedding planning suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      icon: { type: "string", description: "Icon key e.g. mail, camera, map, alert, check, lightbulb" },
                    },
                    required: ["title", "description", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_suggestions" } };
        break;
      }

      // ── daily_report ────────────────────────────────────────────────────
      case "daily_report": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: daily_report
Generate a concise daily wedding planning report.
Include a warm greeting, key highlights from today's activity, and any action items the couple should address.
Always call the generate_daily_report tool.`,
          },
          {
            role: "user",
            content: `Wedding ID: ${params.weddingId}\nDate: ${new Date().toISOString().split("T")[0]}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "generate_daily_report",
            description: "Generate a daily wedding planning report",
            parameters: {
              type: "object",
              properties: {
                greeting: { type: "string", description: "A warm daily greeting" },
                summary: { type: "string", description: "Brief summary of today's activity" },
                highlights: {
                  type: "array",
                  items: { type: "string" },
                  description: "Key highlights from today",
                },
                actionItems: {
                  type: "array",
                  items: { type: "string" },
                  description: "Things the couple should do",
                },
              },
              required: ["greeting", "summary", "highlights", "actionItems"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "generate_daily_report" } };
        break;
      }

      case "suggest_highlights": {
        messages = [
          {
            role: "system",
            content: `${BASE_SYSTEM_PROMPT}

CURRENT TASK: suggest_highlights
Review the list of wedding moments and suggest which ones should be highlighted (featured prominently) in the live feed.
Prioritise moments that:
- Include a photo
- Have a warm, emotional message
- Have received reactions
- Seem special or meaningful

Return a list of moment IDs to highlight. Always call the suggest_highlights tool.`,
          },
          {
            role: "user",
            content: `Moments:\n${JSON.stringify(params.moments, null, 2)}`,
          },
        ];
        tools = [{
          type: "function",
          function: {
            name: "suggest_highlights",
            description: "Suggest which moments to highlight in the live feed",
            parameters: {
              type: "object",
              properties: {
                highlight_ids: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of moment IDs that should be highlighted",
                },
                reasoning: { type: "string", description: "Brief explanation of why these were chosen" },
              },
              required: ["highlight_ids"],
              additionalProperties: false,
            },
          },
        }];
        tool_choice = { type: "function", function: { name: "suggest_highlights" } };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages,
    };
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;

    // For chat assistant, use streaming
    if (type === "chat_assistant") {
      body.stream = true;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", status, t);
        return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming for structured outputs
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    // Handle tool calls
    if (choice?.message?.tool_calls?.[0]) {
      const toolCall = choice.message.tool_calls[0];
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle text response (story generation)
    const content = choice?.message?.content || "";
    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-wedding error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
