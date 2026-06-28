/**
 * Use case: Overwrite an existing key with a new value.
 * Sets a key twice and verifies the second value wins.
 */

import { assertEquals, assertNotEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("upsert overwrites the previous value", async () => {
  const key = testKey("upsert");

  await cache.set(key, { version: 1 }, 300);
  await cache.set(key, { version: 2 }, 300);

  const result = await cache.get<{ version: number }>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value.version, 2);

  await cache.delete(key);
});

Deno.test("upsert updates the expiry", async () => {
  const key = testKey("upsert-ttl");

  await cache.set(key, "first", 60);
  const first = await cache.get(key);

  await cache.set(key, "second", 600);
  const second = await cache.get(key);

  // The second set should have a later expiry
  assertNotEquals(first, null);
  assertNotEquals(second, null);
  assertEquals(second!.expiresAt > first!.expiresAt, true);

  await cache.delete(key);
});
