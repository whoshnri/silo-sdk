/**
 * Use case: Read a key that was never set.
 * The SDK should return null instead of throwing.
 */

import { assertEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("get a key that doesn't exist returns null", async () => {
  const key = testKey("nonexistent");

  const result = await cache.get(key);
  assertEquals(result, null);
});

Deno.test("get a key that was deleted returns null", async () => {
  const key = testKey("deleted-then-get");

  await cache.set(key, "exists", 300);
  await cache.delete(key);

  const result = await cache.get(key);
  assertEquals(result, null);
});
