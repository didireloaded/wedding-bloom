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
  name: "list_weddings",
  title: "List published weddings",
  description: "List published weddings with couple names, date, venue, and slug.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const n = limit ?? 20;
    const res = await supabaseFetch(
      `weddings?select=slug,couple_names,wedding_date,ceremony_venue,published&published=eq.true&order=wedding_date.asc&limit=${n}`
    );
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.status} ${await res.text()}` }], isError: true };
    }
    const rows = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { weddings: rows },
    };
  },
});
