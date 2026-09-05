import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker() {
  const handlers: Record<string, (event: any) => void> = {};
  const openWindow = vi.fn();
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL,
    self: { location: { origin: "https://example.com" }, addEventListener: (name: string, handler: any) => { handlers[name] = handler; }, clients: { matchAll: async () => [], openWindow } },
  });
  return { handlers, openWindow };
}

describe("service worker privacy", () => {
  it("never intercepts Supabase responses", () => {
    const { handlers } = worker();
    const respondWith = vi.fn();
    handlers.fetch({ request: { url: "https://project.supabase.co/rest/v1/rsvps", method: "GET" }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });
  it("does not cache same-origin API data", () => {
    const { handlers } = worker();
    const respondWith = vi.fn();
    handlers.fetch({ request: { url: "https://example.com/api/guests", method: "GET", destination: "" }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });
  it.each(["https://untrusted.example/", "http://["])("keeps notification targets in the app: %s", async target_url => {
    const { handlers, openWindow } = worker();
    let pending: Promise<unknown> | undefined;
    handlers.notificationclick({ notification: { close: vi.fn(), data: { target_url } }, waitUntil: (promise: Promise<unknown>) => { pending = promise; } });
    await pending;
    expect(openWindow).toHaveBeenCalledWith("https://example.com/");
  });
});
