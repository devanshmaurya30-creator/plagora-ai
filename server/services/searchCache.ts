interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class SearchCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttlMs = 1000 * 60 * 60; // 1 hour TTL
  private maxEntries = 200;

  private generateKey(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  get<T>(query: string): T | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(query: string, data: T): void {
    const key = this.generateKey(query);
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const searchCache = new SearchCache();
