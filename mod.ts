/**
 * Silo SDK — a tiny client for your self-hosted kv cache.
 *
 * Usage:
 *   const cache = new Silo({ url: "http://localhost:8000", bucketId: "...", bucketKey: "..." });
 *   await cache.set("user:123", { name: "John" }, 3600);
 *   const data = await cache.get("user:123");
 *   await cache.delete("user:123");
 */

/**
 * Configuration options for initializing the Silo cache client.
 */
type SiloConfig = {
  /** The base URL of the self-hosted Silo server (e.g. "http://localhost:8000"). */
  url: string;
  /** The unique ID of the target bucket. */
  bucketId: string;
  /** The authorization key required to access the target bucket. */
  bucketKey: string;
};

/**
 * The client SDK for interacting with a self-hosted Silo KV cache.
 */
class Silo {
  private url: string;
  private bucketId: string;
  private bucketKey: string;

  /**
   * Initializes a new instance of the Silo client.
   * @param config The client configuration settings.
   */
  constructor(config: SiloConfig) {
    this.url = config.url;
    this.bucketId = config.bucketId;
    this.bucketKey = config.bucketKey;
  }

  private endpoint(key: string): string {
    return `${this.url}/v1/${this.bucketId}/${key}`;
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bucket ${this.bucketKey}`,
    };
  }

  /**
   * Stores a value in the cache bucket under the specified key, with an optional TTL.
   * Values exceeding Deno KV's single-key limit (64KB) are automatically chunked.
   *
   * @param key The cache key to set.
   * @param value The value to cache (must be JSON-serializable).
   * @param ttl Optional Time-To-Live in seconds.
   * @returns A promise that resolves to the set operation metadata.
   */
  async set(key: string, value: unknown, ttl?: number): Promise<{ bucketId: string; key: string; ttl: number }> {
    const res = await fetch(this.endpoint(key), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ value, ttl }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `SET failed: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Retrieves a cached value by its key.
   * Chunked large values are automatically reconstructed on retrieval.
   *
   * @template T The expected type of the cached value.
   * @param key The cache key to retrieve.
   * @returns A promise resolving to the value envelope, or null if key does not exist or has expired.
   */
  async get<T = unknown>(key: string): Promise<{ value: T; expiresAt: number } | null> {
    const res = await fetch(this.endpoint(key), {
      method: "GET",
      headers: this.headers(),
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `GET failed: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Deletes a cached value by its key. If the value was chunked, all associated chunks are cleaned up.
   *
   * @param key The cache key to delete.
   * @returns A promise resolving to the deletion metadata.
   */
  async delete(key: string): Promise<{ bucketId: string; key: string; deleted: true }> {
    const res = await fetch(this.endpoint(key), {
      method: "DELETE",
      headers: this.headers(),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `DELETE failed: ${res.statusText}`);
    }

    return await res.json();
  }
}

export { Silo };
export type { SiloConfig };
