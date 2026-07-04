import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseFetch(path: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}

export default defineTool({
  name: "get_wedding_events",
  title: "Get wedding event schedule",
  description: "Return the schedule of events (ceremony, reception, etc.) for a wedding by slug.",
  inputSchema: {
    slug: z.string().min(1).describe("The wedding slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const w = await supabaseFetch(`weddings?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!w.ok) return { content: [{ type: "text", text: `Error: ${w.status}` }], isError: true };
    const [wedding] = await w.json();
    if (!wedding) return { content: [{ type: "text", text: `No wedding for slug '${slug}'.` }], isError: true };
    const res = await supabaseFetch(
      `events?select=title,event_time,location,description&wedding_id=eq.${wedding.id}&order=event_time.asc`
    );
    if (!res.ok) return { content: [{ type: "text", text: `Error: ${res.status}` }], isError: true };
    const events = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
      structuredContent: { events },
    };
  },
});
