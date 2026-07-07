/**
 * ForeverVow — In-Memory Cache Service
 * High-performance TTL cache to eliminate redundant database reads.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static store = new Map<string, CacheEntry<any>>();

  /**
   * Retrieve an item from the cache. Returns null if expired or not found.
   */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Store an item in the cache with a specified Time-To-Live in milliseconds.
   * Defaults to 5 minutes if no TTL is provided.
   */
  static set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Check if a valid, unexpired key exists in the cache.
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific key from the cache.
   */
  static invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or wildcard pattern (e.g. "wedding:*").
   * Returns the number of entries removed.
   */
  static invalidatePattern(pattern: string): number {
    const cleanPrefix = pattern.replace(/\*$/, "");
    let count = 0;

    for (const key of this.store.keys()) {
      if (key.startsWith(cleanPrefix)) {
        this.store.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear the entire cache.
   */
  static clear(): void {
    this.store.clear();
  }

  /**
   * Get current number of stored entries (including potentially expired ones).
   */
  static size(): number {
    return this.store.size;
  }

  /**
   * Prune expired entries from memory.
   */
  static prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}
