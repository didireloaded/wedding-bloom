import { defineMcp } from "@lovable.dev/mcp-js";
import listWeddings from "./tools/list-weddings";
import getWedding from "./tools/get-wedding";
import getEvents from "./tools/get-events";

export default defineMcp({
  name: "forevervow-mcp",
  title: "ForeverVow MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for ForeverVow, a luxury digital wedding invitation platform. Use `list_weddings` to discover published weddings, `get_wedding` to fetch details by slug, and `get_wedding_events` for the ceremony/reception schedule.",
  tools: [listWeddings, getWedding, getEvents],
});
