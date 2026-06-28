/**
 * Use case: Delete a cached value before it expires.
 * Sets a key, deletes it, then verifies get returns null.
 */

import { assertEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("delete a key and verify it's gone", async () => {
  const key = testKey("delete");

  await cache.set(key, { temp: true }, 300);

  const deleteResult = await cache.delete(key);
  assertEquals(deleteResult.deleted, true);
  assertEquals(deleteResult.key, key);

  const getResult = await cache.get(key);
  assertEquals(getResult, null);
});

Deno.test("delete a key that doesn't exist still succeeds", async () => {
  const key = testKey("delete-missing");

  // Should not throw — the server always returns success
  const result = await cache.delete(key);
  assertEquals(result.deleted, true);
});
