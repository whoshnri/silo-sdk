/**
 * Use case: Verify that values expire after their TTL.
 * Sets a key with a 2-second TTL, waits, then checks it's gone.
 * 
 * Note: This test takes ~3 seconds to run due to the wait.
 */

import { assertEquals, assertNotEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.test("value expires after TTL", async () => {
  const key = testKey("ttl-expiry");

  // Set with a 2-second TTL
  await cache.set(key, "short-lived", 2);

  // Should exist immediately
  const before = await cache.get(key);
  assertNotEquals(before, null);
  assertEquals(before!.value, "short-lived");

  // Wait for expiry (2s TTL + 1s buffer)
  await sleep(3000);

  // Should be gone now
  const after = await cache.get(key);
  assertEquals(after, null);
});
