import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "./CacheService";

describe("CacheService", () => {
  beforeEach(() => {
    CacheService.clear();
    vi.useRealTimers();
  });

  it("should store and retrieve values within TTL", () => {
    CacheService.set("test_key", { name: "Château Wedding" }, 10000);
    const result = CacheService.get<{ name: string }>("test_key");
    expect(result).toEqual({ name: "Château Wedding" });
    expect(CacheService.has("test_key")).toBe(true);
  });

  it("should return null and evict item when TTL expires", () => {
    vi.useFakeTimers();
    CacheService.set("temp_key", "ephemeral", 5000); // 5 sec TTL

    expect(CacheService.get("temp_key")).toBe("ephemeral");

    // Advance time by 6 seconds
    vi.advanceTimersByTime(6000);

    expect(CacheService.get("temp_key")).toBeNull();
    expect(CacheService.has("temp_key")).toBe(false);
  });

  it("should invalidate specific keys", () => {
    CacheService.set("key1", "val1");
    CacheService.set("key2", "val2");

    CacheService.invalidate("key1");

    expect(CacheService.get("key1")).toBeNull();
    expect(CacheService.get("key2")).toBe("val2");
  });

  it("should invalidate keys matching a pattern", () => {
    CacheService.set("wedding:123:details", { title: "Wedding A" });
    CacheService.set("wedding:123:guests", [{ name: "Alice" }]);
    CacheService.set("wedding:456:details", { title: "Wedding B" });
    CacheService.set("user:789:profile", { email: "test@example.com" });

    const removedCount = CacheService.invalidatePattern("wedding:123:*");

    expect(removedCount).toBe(2);
    expect(CacheService.get("wedding:123:details")).toBeNull();
    expect(CacheService.get("wedding:123:guests")).toBeNull();
    expect(CacheService.get("wedding:456:details")).toEqual({ title: "Wedding B" });
    expect(CacheService.get("user:789:profile")).toEqual({ email: "test@example.com" });
  });

  it("should prune expired keys from memory", () => {
    vi.useFakeTimers();
    CacheService.set("active1", "ok", 10000);
    CacheService.set("expired1", "old", 2000);
    CacheService.set("expired2", "old", 3000);

    vi.advanceTimersByTime(4000); // 4 seconds pass -> expired1 and expired2 should expire

    const prunedCount = CacheService.prune();
    expect(prunedCount).toBe(2);
    expect(CacheService.size()).toBe(1);
    expect(CacheService.get("active1")).toBe("ok");
  });
});
