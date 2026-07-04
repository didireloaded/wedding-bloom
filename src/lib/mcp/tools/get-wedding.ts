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
  name: "get_wedding",
  title: "Get wedding details",
  description: "Fetch a published wedding by its slug, including story, date, and venue.",
  inputSchema: {
    slug: z.string().min(1).describe("The wedding slug from the public URL (e.g. 'towa-mathew')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const res = await supabaseFetch(
      `weddings?select=slug,couple_names,wedding_date,ceremony_time,ceremony_venue,story,dress_code,published&slug=eq.${encodeURIComponent(slug)}&limit=1`
    );
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.status} ${await res.text()}` }], isError: true };
    }
    const rows = await res.json();
    if (!rows[0]) {
      return { content: [{ type: "text", text: `No wedding found for slug '${slug}'.` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(rows[0], null, 2) }],
      structuredContent: { wedding: rows[0] },
    };
  },
});
